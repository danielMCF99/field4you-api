import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/UserRepository';

export const createUser = async (
  user: User,
  repository: IUserRepository
): Promise<User | undefined> => {
  try {
    const newUser = await repository.create(user);
    return newUser;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
