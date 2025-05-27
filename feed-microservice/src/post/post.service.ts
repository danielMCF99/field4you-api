import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FirebaseRepository } from 'src/firebase/firebase.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { Post } from './schemas/post.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private firebaseRepository: FirebaseRepository,
  ) {}

  async create(
    headers: Record<string, string>,
    file: Express.Multer.File,
    createPostDto: CreatePostDto,
  ): Promise<Post> {
    console.log('Ficheiro:', file?.originalname);
    console.log('Comentário recebido:', createPostDto.comment);

    const creatorId = headers['x-user-id'];
    const creatorEmail = headers['x-user-email'];
    const userType = headers['x-user-type'];

    if (!creatorId || !creatorEmail) {
      throw new UnauthorizedException('Missing user identification in headers');
    }

    const { imageUrl, fileName } =
      await this.firebaseRepository.uploadImageToStorageOnly(file);

    const post = await this.postModel.create({
      creatorId: creatorId,
      creatorEmail: creatorEmail,
      userType: userType,
      imageUrl: imageUrl,
      fileName: fileName,
      comment: createPostDto.comment,
    });

    console.log(post);
    return post;
  }

  async listPosts(filters: GetAllPostsDto) {
    console.log('Entered get all posts service');
    const { creatorEmail, startDate, endDate, page, limit, userType } = filters;

    const query: any = {};

    if (creatorEmail) {
      query.creatorEmail = { $regex: creatorEmail, $options: 'i' };
    }

    if (userType) {
      query.userType = userType;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [postsList, totalPosts] = await Promise.all([
      this.postModel
        .find(query)
        .select('_id creatorEmail comment fileName imageUrl createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments(query),
    ]);

    return {
      postsList,
      totalPosts,
      page,
      totalPages: Math.ceil(totalPosts / limit),
    };
  }

  async remove(headers: Record<string, string>, id: string) {
    const creatorEmail = headers['x-user-email'];
    const userType = headers['x-user-type'];

    if (!creatorEmail || !userType) {
      throw new UnauthorizedException('Missing user identification in headers');
    }

    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (userType != 'admin') {
      if (creatorEmail != post.creatorEmail) {
        throw new UnauthorizedException('User is not allowed to delete post');
      }
    }

    await this.firebaseRepository.deletePost(post.fileName);
    await this.postModel.findByIdAndDelete(id);

    return {
      deletedPostId: post._id,
      message: 'Post was successfully deleted',
    };
  }

  async getStatistics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date(now).setDate(now.getDate() - 60);

    const [last30DaysCount, previous30DaysCount] = await Promise.all([
      this.postModel.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      }),
      this.postModel.countDocuments({
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      }),
    ]);

    const differencePercentage =
      previous30DaysCount === 0
        ? last30DaysCount > 0
          ? 100
          : 0
        : ((last30DaysCount - previous30DaysCount) / previous30DaysCount) * 100;

    const postsPerDay: { date: string; count: number }[] = [];

    const countPromises = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(now.getDate() - i);

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const key = start.toISOString().split('T')[0];

      return this.postModel
        .countDocuments({ createdAt: { $gte: start, $lte: end } })
        .then((count) => ({ date: key, count }));
    });

    const results = await Promise.all(countPromises);

    // Ordenar por data ascendente
    postsPerDay.push(
      ...results.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    );
    return {
      last30DaysCount,
      previous30DaysCount,
      differencePercentage: Number(differencePercentage.toFixed(2)),
      postsPerDay,
    };
  }
}
