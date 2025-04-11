import { userRepository } from '../../app';
import { User } from '../../domain/entities/User';

export const createUser = async (user: any): Promise<User | undefined> => {
  const userId = user.userId;
  user._id = userId.toString();
  const newUser = await userRepository.create(user);
  return newUser;
};
