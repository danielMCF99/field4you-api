import { User } from '../../domain/entities/User';
import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../domain/interfaces/UserRepository';

export const loginUser = async (
  email: string,
  password: string,
  repository: IUserRepository
): Promise<{
  success: boolean;
  status: number;
  message: string;
  userId?: string;
  userType: string;
}> => {
  try {
    // Find user by email
    const user: User | undefined = await repository.findByEmail(email);

    // If user not found return 404 status with customized message
    if (!user) {
      return {
        success: false,
        status: 404,
        message: 'User not found',
        userId: 'N/A',
        userType: 'N/A',
      };
    }

    // Hash password sent in request and compare it to DB value
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return {
        success: false,
        status: 401,
        message: 'Invalid password',
        userId: 'N/A',
        userType: 'N/A',
      };
    }

    // Update the last access date of the User
    const lastAccessDate = new Date();
    await repository.update(user.getId(), { lastAccessDate: lastAccessDate });
    console.log('Updated user last access date');

    return {
      success: true,
      status: 200,
      message: 'Valid credentials for login',
      userId: user.getId(),
      userType: user.userType,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      status: 500,
      message: 'Something went wrong',
      userId: 'N/A',
      userType: 'N/A',
    };
  }
};
