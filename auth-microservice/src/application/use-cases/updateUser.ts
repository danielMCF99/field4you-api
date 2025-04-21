import { userRepository } from "../../app";
import { User } from "../../domain/entities/User";
import { InternalServerErrorException } from "../../domain/exceptions/InternalServerErrorException";

export const updateUser = async (
  userId: string,
  user: Partial<User>
): Promise<any> => {
  try {
    const updatedUser = await userRepository.update(userId, user);
    return updatedUser;
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};
