import { authRepository } from '../../app';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';

export const deleteUser = async (id: string): Promise<Boolean> => {
  try {
    // Delete User from Database
    await authRepository.delete(id);

    return true;
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};
