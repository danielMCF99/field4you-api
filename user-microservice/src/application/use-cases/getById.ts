import { Request } from 'express';
import mongoose from 'mongoose';
import { authMiddleware, jwtHelper, userRepository } from '../../app';
import { User } from '../../domain/entities/User';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';

export const getById = async (req: Request): Promise<User> => {
  const id = req.params.id.toString();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }

  const token = await jwtHelper.extractBearerToken(req);
  if (!token) {
    throw new UnauthorizedException('Authentication token is required');
  }

  const tokenExpired = await authMiddleware.validateToken(token);

  if (!tokenExpired) {
    throw new UnauthorizedException('Bearer token validation expired');
  }

  try {
    const user = await userRepository.getById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  } catch (error: any) {
    if (error instanceof NotFoundException) {
      throw new NotFoundException(error.message);
    } else {
      throw new InternalServerErrorException(error.message);
    }
  }
};
