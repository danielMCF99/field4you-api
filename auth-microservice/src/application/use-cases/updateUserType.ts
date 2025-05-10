import { authRepository } from '../../app';
import { UserType } from '../../domain/entities/Auth';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';

export const updateUserType = async (
  userId: string,
  UserType: UserType
): Promise<any> => {
  try {
    console.log(userId, UserType);
    const updatedAuth = await authRepository.update(userId, {
      userType: UserType,
    });
    return updatedAuth;
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};
