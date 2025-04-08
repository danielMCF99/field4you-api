import bcrypt from 'bcryptjs';
import { Request } from 'express';
import { jwtHelper, userRepository } from '../../app';
import { User } from '../../domain/entities/User';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';

export const loginUser = async (req: Request): Promise<string> => {
  // Validate request body integrity
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestException('Email and Password are required');
  }

  try {
    // Find user by email
    const user: User | undefined = await userRepository.findByEmail(email);

    // If user not found return 404 status with customized message
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash password sent in request and compare it to DB value
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT Token
    const token = await jwtHelper.generateToken(
      user.getId(),
      user.userType.toString(),
      email
    );

    // Update the last access date of the User
    const lastAccessDate = new Date();
    await userRepository.update(user.getId(), {
      lastAccessDate: lastAccessDate,
    });

    return token;
  } catch (error: any) {
    if (error instanceof NotFoundException) {
      throw new NotFoundException(error.message);
    } else if (error instanceof UnauthorizedException) {
      throw new UnauthorizedException(error.message);
    } else {
      throw new InternalServerErrorException(error.message);
    }
  }
};
