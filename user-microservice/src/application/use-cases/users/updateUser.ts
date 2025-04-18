import { Request } from 'express';
import mongoose from 'mongoose';
import { userRepository } from '../../../app';
import { User } from '../../../domain/entities/User';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../../domain/exceptions/UnauthorizedException';
import { publishUserUpdate } from '../../../infrastructure/middlewares/rabbitmq.publisher';

export const updateUser = async (req: Request): Promise<User> => {
  const id = req.params.id.toString();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }

  const authUserId = req.headers['x-user-id'] as string | undefined;
  if (!authUserId) {
    throw new InternalServerErrorException('Internal Server Error');
  }

  const user = await userRepository.getById(id);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.getId() != authUserId) {
    throw new UnauthorizedException(
      "You don't have permission to edit this user"
    );
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

  const updatedData: Record<string, any> = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updatedData[key] = req.body[key];
    }
  });

  try {
    const updatedUser = await userRepository.update(user.getId(), {
      ...updatedData,
    });

    if (!updatedUser) {
      throw new InternalServerErrorException(
        'Internal server error when updating the user'
      );
    }

    publishUserUpdate({ userId: id, updatedData });

    return updatedUser;
  } catch (error) {
    throw new InternalServerErrorException(
      'Internal server error when updating the user'
    );
  }
};
