import { Request } from 'express';
import { User } from '../../domain/entities/User';
import { authMiddleware, jwtHelper, userRepository } from '../../app';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';

export const getAll = async (req: Request): Promise<User[]> => {
  const token = await jwtHelper.extractBearerToken(req);
  if (!token) {
    throw new UnauthorizedException('Authentication token is required');
  }
  const tokenExpired = await authMiddleware.validateToken(token);

  if (!tokenExpired) {
    throw new UnauthorizedException('Bearer token validation expired');
  }

  try {
    const users = await userRepository.getAll();
    return users;
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};
