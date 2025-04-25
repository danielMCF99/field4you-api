import { userRepository } from '../../app';
import { UserStatus } from '../../domain/entities/User';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';

export const updateUser = async (
  userId: string,
  status: UserStatus
): Promise<any> => {
  try {
    const updatedUser = await userRepository.update(userId, { status: status });
    return updatedUser;
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};
