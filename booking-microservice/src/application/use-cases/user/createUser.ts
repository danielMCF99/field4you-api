import { User } from '../../../domain/entities/User';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { userRepository } from '../../../app';

export const createUser = async (user: any): Promise<User | undefined> => {
  const { authServiceUserId, userType, email, firstName, lastName } = user;

  if (!authServiceUserId || !userType || !email || !firstName || !lastName) {
    throw new BadRequestException(
      'Missing fields for user registration. Please try again.'
    );
  }

  try {
    const newUser = await userRepository.create(
      new User({
        authServiceUserId,
        userType,
        email,
        firstName,
        lastName,
      })
    );
    return newUser;
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};
