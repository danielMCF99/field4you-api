import { userRepository } from '../../../app';
import { User } from '../../../domain/entities/User';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';

export const createUser = async (user: any): Promise<User | undefined> => {
  const userId = user.userId;
  try {
    user._id = userId.toString();
    const newUser = await userRepository.create(user);
    return newUser;
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};
