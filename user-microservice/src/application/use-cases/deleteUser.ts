import { authMiddleware, jwtHelper, userRepository } from '../../app';
import { Request } from 'express';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { ForbiddenException } from '../../domain/exceptions/ForbiddenException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import mongoose from 'mongoose';

export const deleteUser = async (req: Request): Promise<Boolean> => {
  const id = req.params.id.toString();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }

  const token = await jwtHelper.extractBearerToken(req);
  if (!token) {
    throw new UnauthorizedException('Authentication token is required');
  }

  const isValidToken = await authMiddleware.validateToken(token);
  if (!isValidToken) {
    throw new UnauthorizedException('Authentication token has expired');
  }

  try {
    const user = await userRepository.getById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hasValidPermissions = await authMiddleware.validateUserPermission(
      id,
      user.email,
      token
    );
    if (!hasValidPermissions) {
      throw new ForbiddenException(
        'User does not have permission to perform this action'
      );
    }

    const deletedUser = await userRepository.delete(user.getId());
    if (!deletedUser) {
      throw new InternalServerErrorException(
        'Internal server error when deleting the user'
      );
    }

    return deletedUser;
  } catch (error: any) {
    if (error instanceof NotFoundException) {
      throw new NotFoundException(error.message);
    } else if (error instanceof ForbiddenException) {
      throw new ForbiddenException(error.message);
    } else {
      throw new InternalServerErrorException(error.message);
    }
  }
};
