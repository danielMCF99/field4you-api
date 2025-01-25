import { Request } from 'express';
import mongoose from 'mongoose';
import { jwtHelper, userRepository } from '../../app';
import { authMiddleware } from '../../app';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';

export const deleteUser = async (req: Request): Promise<Boolean> => {
  const id = req.params.id.toString();
  const token = await jwtHelper.extractBearerToken(req);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid UserID format.');
  }

  if (!token) {
    throw new UnauthorizedException('Bearer token required');
  }

  try {
    // Get User from Database
    const user = await userRepository.getById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate User Permission
    const isValid = await authMiddleware.validateUserPermission(
      user.getId(),
      user.email,
      token
    );

    if (!isValid) {
      throw new UnauthorizedException('Authentication failed');
    }

    // Delete User from Database
    await userRepository.delete(id);

    return true;
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
