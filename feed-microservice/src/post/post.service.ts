import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FirebaseRepository } from 'src/firebase/firebase.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './schemas/post.schema';
import { GetAllPostsDto } from './dto/get-all-posts.dto';

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
    const creatorId = headers['x-user-id'];
    const creatorEmail = headers['x-user-email'];

    if (!creatorId || !creatorEmail) {
      throw new UnauthorizedException('Missing user identification in headers');
    }

    const { imageUrl, fileName } =
      await this.firebaseRepository.uploadImageToStorageOnly(file);

    const post = await this.postModel.create({
      creatorId,
      creatorEmail,
      imageUrl,
      fileName,
      comments: createPostDto.comments,
    });

    return post;
  }

  async listPosts(filters: GetAllPostsDto) {
    const { creatorEmail, startDate, endDate, page, limit } = filters;

    const query: any = {};
    if (creatorEmail) {
      query.creatorEmail = creatorEmail;
    }

    if (startDate || filters?.endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [postsList, totalPosts] = await Promise.all([
      this.postModel
        .find(query)
        .select('_id creatorEmail comments fileName imageUrl createdAt')
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

    if (!creatorEmail) {
      throw new UnauthorizedException('Missing user identification in headers');
    }

    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (creatorEmail != post.creatorEmail) {
      throw new UnauthorizedException('User is not allowed to delete post');
    }

    await this.firebaseRepository.deletePost(id);
    await this.postModel.findByIdAndDelete(id);

    return post._id;
  }
}
