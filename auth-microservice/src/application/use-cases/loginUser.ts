import bcrypt from 'bcryptjs';
import { Request } from 'express';
import { authRepository, jwtHelper, loginHistoryRepository } from '../../app';
import { Auth, UserStatus } from '../../domain/entities/Auth';
import { LoginHistory } from '../../domain/entities/LoginHistory';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { ForbiddenException } from '../../domain/exceptions/ForbiddenException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';

export const loginUser = async (req: Request): Promise<string> => {
  // Validate request body integrity
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestException('Email and Password are required');
  }

  // Find user by email
  const auth: Auth | undefined = await authRepository.findByEmail(email);

  // If user not found return 404 status with customized message
  if (!auth) {
    throw new NotFoundException('User not found');
  }

  if (auth.status == UserStatus.inactive) {
    throw new ForbiddenException(
      'User is inactive and therefore unable to login. Please contact support for help'
    );
  }

  // Hash password sent in request and compare it to DB value
  const isMatch = await bcrypt.compare(password, auth.password);
  if (!isMatch) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // Generate JWT Token
  const token = await jwtHelper.generateToken(
    auth.getId(),
    auth.userType.toString(),
    email
  );

  // Update the last access date of the User
  const lastAccessDate = new Date();
  await authRepository.update(auth.getId(), {
    lastAccessDate: lastAccessDate,
  });

  // Create new LoginHistory entry
  const newLoginHistory: LoginHistory = new LoginHistory({
    userId: auth.getId(),
    loginDate: lastAccessDate,
  });
  loginHistoryRepository.create(newLoginHistory);

  return token;
};
