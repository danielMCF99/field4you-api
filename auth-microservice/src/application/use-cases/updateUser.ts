import { authRepository } from '../../app';
import { UserStatus } from '../../domain/entities/Auth';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';

export const updateUser = async (
  userId: string,
  status: UserStatus
): Promise<any> => {
  try {
    const updatedAuth = await authRepository.update(userId, { status: status });
    return updatedAuth;
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};
