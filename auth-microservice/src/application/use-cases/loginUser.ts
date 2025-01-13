import { Request } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/UserRepository';
import { jwtHelper } from '../../app';

export const loginUser = async (
  req: Request,
  repository: IUserRepository
): Promise<{
  status: number;
  message?: string;
  token?: string;
}> => {
  try {
    // Validate request body integrity
    const { email, password } = req.body;

    if (!email || !password) {
      return {
        status: 400,
        message: 'Email and Password are required',
      };
    }

    // Find user by email
    const user: User | undefined = await repository.findByEmail(email);

    // If user not found return 404 status with customized message
    if (!user) {
      return {
        status: 404,
        message: 'User not found',
      };
    }

    // Hash password sent in request and compare it to DB value
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return {
        status: 401,
        message: 'Invalid password',
      };
    }

    // Generate JWT Token
    const token = await jwtHelper.generateToken(
      user.getId(),
      user.userType.toString(),
      email
    );

    // Update the last access date of the User
    const lastAccessDate = new Date();
    await repository.update(user.getId(), { lastAccessDate: lastAccessDate });
    console.log('Updated user last access date');

    return {
      status: 200,
      message: 'Login was successfull.',
      token: token,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: 'Something went wrong',
    };
  }
};
