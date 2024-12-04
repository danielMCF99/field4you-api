import { IUserRepository } from '../../domain/interfaces/UserRepository';
import { authMiddleware } from '../../app';

export const deleteUser = async (
  id: string,
  token: string,
  repository: IUserRepository
): Promise<{ status: number; message: string }> => {
  try {
    const user = await repository.getById(id);

    if (!user) {
      return {
        status: 404,
        message: 'User with given ID not found',
      };
    }

    const authenticated = await authMiddleware.authenticate(
      id,
      user.email,
      token
    );

    if (!authenticated) {
      return {
        status: 401,
        message: 'Authentication failed',
      };
    }

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
      message: 'Something went wrong with user update',
    };
  }
};
