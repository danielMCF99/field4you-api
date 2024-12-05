import { Post } from '../../domain/entities/Post';
import { IPostRepository } from '../../domain/interfaces/PostRepository';
import { PostModel } from '../database/models/post.model';

export class MongoPostRepository implements IPostRepository {
  private static instance: MongoPostRepository;

  // Private constructor to prevent direct instantiation
  private constructor() {}

  // Static method to get the single instance
  public static getInstance(): MongoPostRepository {
    if (!MongoPostRepository.instance) {
      MongoPostRepository.instance = new MongoPostRepository();
    }
    return MongoPostRepository.instance;
  }

  async create(post: Post): Promise<Post> {
    const newPost = await PostModel.create(post);
    return Post.fromMongooseDocument(newPost);
  }

  async getById(id: string): Promise<Post | undefined> {
    const post = await PostModel.findById(id);

    if (post === null) {
      return undefined;
    }
    return Post.fromMongooseDocument(post);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await PostModel.findByIdAndDelete(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getLast10(): Promise<Post[]> {
    const allPosts = await PostModel.find()
      .sort({ creationDate: -1 })
      .limit(10);
    return allPosts.map((post) => Post.fromMongooseDocument(post));
  }
}
