import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/UserRepository';

export const getAll = async (repository: IUserRepository): Promise<User[]> => {
  try {
    const allUsers = await repository.getAll();
    return allUsers;
  } catch (error) {
    console.log(error);
    return [];
  }
};
