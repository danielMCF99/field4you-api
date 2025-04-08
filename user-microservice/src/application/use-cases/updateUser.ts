import { Request } from 'express';
import mongoose from 'mongoose';
import { authMiddleware, jwtHelper, userRepository } from '../../app';
import { User } from '../../domain/entities/User';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { ForbiddenException } from '../../domain/exceptions/ForbiddenException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';

export const updateUser = async (req: Request): Promise<User> => {
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

  // Validate that fields sent in the request body are allowed to be updated
  const allowedFields = [
    'phoneNumber',
    'district',
    'city',
    'address',
    'latitude',
    'longitude',
  ];

  const filteredBody: Record<string, any> = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  try {
    const user = await userRepository.getById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hasValidPermissions = await authMiddleware.validateUserPermission(
      user.getId(),
      user.email,
      token
    );
    if (!hasValidPermissions) {
      throw new ForbiddenException(
        'User does not have permission to perform this action'
      );
    }

    const updatedUser = await userRepository.update(user.getId(), {
      ...filteredBody,
    });
    if (!updatedUser) {
      throw new InternalServerErrorException(
        'Internal server error when updating the user'
      );
    }

    console.log('Updated user info');
    return updatedUser;
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
