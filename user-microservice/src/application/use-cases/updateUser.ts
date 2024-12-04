import { authMiddleware } from '../../app';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/UserRepository';

export const updateUser = async (
  id: string,
  token: string,
  updatedData: Partial<User>,
  repository: IUserRepository
): Promise<{ status: number; message: string; user?: User }> => {
  try {
    const user = await repository.getById(id);

    if (!user) {
      return {
        status: 404,
        message: 'User with given ID not found',
      };
    }

    const authenticated = await authMiddleware.authenticate(
      user.getAuthServiceUserId(),
      user.email,
      token
    );

    if (!authenticated) {
      return {
        status: 401,
        message: 'Authentication failed',
      };
    }

    const updatedUser = await repository.update(user.getId(), {
      lastAccessDate: new Date(),
      ...updatedData,
    });
    console.log('Updated user info');

    return {
      status: 200,
      message: 'User updated successfull',
      user: updatedUser,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: 'Something went wrong with user update',
    };
  }
};
