import { userRepository } from '../../app';
import { UserType } from '../../domain/entities/User';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';

export const updateUserType = async (
  userId: string,
  UserType: UserType
): Promise<any> => {
  try {
    console.log(userId, UserType);
    const updatedUser = await userRepository.update(userId, {
      userType: UserType,
    });
    return updatedUser;
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};
