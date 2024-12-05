import { IPostRepository } from '../../domain/interfaces/PostRepository';
import { authMiddleware, bucket } from '../../app';

export const deletePost = async (
  id: string,
  token: string,
  repository: IPostRepository
): Promise<{ status: number; message: string }> => {
  try {
    const post = await repository.getById(id);

    if (!post) {
      return {
        status: 404,
        message: 'Post with given ID not found',
      };
    }

    const authenticated = await authMiddleware.authenticate(
      post.creatorId,
      token
    );

    if (!authenticated) {
      return {
        status: 401,
        message: 'Authentication failed',
      };
    }

    // Delete from firebase
    await bucket.file(post.imageURL).delete();

    const isDeleted = await repository.delete(id);
    if (!isDeleted) {
      return {
        status: 500,
        message: 'Error when deleting resource',
      };
    }

    return {
      status: 200,
      message: 'Resource deleted',
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: 'Something went wrong with post delete',
    };
  }
};
