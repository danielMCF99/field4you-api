import { userRepository } from '../../../app';
import { User } from '../../../domain/entities/User';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';

export const createUser = async (user: any): Promise<User | undefined> => {
  try {
    const userId = user.userId;
    user._id = userId.toString();
    const newUser = await userRepository.create(user);
    return newUser;
  } catch (error) {
    throw new InternalServerErrorException('Error creating user using queue');
  }
};
