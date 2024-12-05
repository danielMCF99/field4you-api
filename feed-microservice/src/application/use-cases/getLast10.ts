import { Post } from '../../domain/entities/Post';
import { IPostRepository } from '../../domain/interfaces/PostRepository';

export const getLast10 = async (
  repository: IPostRepository
): Promise<Post[]> => {
  try {
    const allPosts = await repository.getLast10();
    return allPosts;
  } catch (error) {
    console.log(error);
    return [];
  }
};
