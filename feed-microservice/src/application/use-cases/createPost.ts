import { Post } from '../../domain/entities/Post';
import { IPostRepository } from '../../domain/interfaces/PostRepository';

export const createPost = async (
  post: Post,
  repository: IPostRepository
): Promise<Post | undefined> => {
  try {
    const newPost = await repository.create(post);
    return newPost;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
