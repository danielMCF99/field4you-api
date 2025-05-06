import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './schemas/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async create(
    headers: Record<string, string>,
    createPostDto: CreatePostDto,
  ): Promise<Post> {
    const createdPost = await this.postModel.create({
      ...createPostDto,
      creatorId: headers['x-user-id'],
      creatorEmail: headers['x-user-email'],
    });
    return createdPost;
  }

  findAll(): Promise<Post[]> {
    return this.postModel.find().exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  async remove(id: string) {
    const deleteResponse = await this.postModel.findByIdAndDelete(id);
    return `This action removes a #${id} post`;
  }
}
