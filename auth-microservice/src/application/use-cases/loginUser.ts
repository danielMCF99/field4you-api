import bcrypt from 'bcryptjs';
import { formatISO } from 'date-fns';
import { Request } from 'express';
import { authRepository, jwtHelper, loginHistoryRepository } from '../../app';
import { Auth, UserStatus } from '../../domain/entities/Auth';
import { LoginHistory } from '../../domain/entities/LoginHistory';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { ForbiddenException } from '../../domain/exceptions/ForbiddenException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { publishUserUpdate } from '../../infrastructure/rabbitmq/rabbitmq.publisher';

export const loginUser = async (req: Request): Promise<string> => {
  // Validate request body integrity
  const { email, password, pushNotificationToken } = req.body;

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

  if (
    pushNotificationToken &&
    auth.pushNotificationToken !== pushNotificationToken
  ) {
    authRepository.update(auth.getId(), { pushNotificationToken });
    publishUserUpdate({
      userId: auth.getId(),
      pushNotificationToken,
    });
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
  const today = formatISO(new Date(), { representation: 'date' });
  const newLoginHistory: LoginHistory = new LoginHistory({
    userId: auth.getId(),
    loginDate: lastAccessDate,
    loginDay: today,
  });
  try {
    await loginHistoryRepository.create(newLoginHistory);
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key (login já registrado hoje), ignora
    } else {
      console.log(error.message);
      throw error;
    }
  }

  return token;
};
