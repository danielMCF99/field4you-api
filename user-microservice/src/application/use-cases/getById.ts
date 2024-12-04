import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/UserRepository';

export const getById = async (
  id: string,
  repository: IUserRepository
): Promise<{ found: boolean; user?: User }> => {
  try {
    const user = await repository.getById(id);

    let foundUser = true;
    if (!user) {
      foundUser = false;
    }

    return { found: foundUser, user: user };
  } catch (error) {
    console.log(error);
    return { found: false, user: undefined };
  }
};
