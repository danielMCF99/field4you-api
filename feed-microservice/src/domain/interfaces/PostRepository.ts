import { Post } from '../entities/Post';

export interface IPostRepository {
  create(post: Post): Promise<Post>;
  getById(id: string): Promise<Post | undefined>;
  getLast10(): Promise<Post[]>;
  delete(id: string): Promise<boolean>;
}
