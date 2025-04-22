import { Request } from 'express';
import { userRepository } from '../../../app';
import { User } from '../../../domain/entities/User';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { publishUserStatusUpdate } from '../../../infrastructure/middlewares/rabbitmq.publisher';

export const updateUserStatus = async (req: Request): Promise<User> => {
  const userId = req.headers['x-user-id'] as string | undefined;
  if (!userId) {
    throw new InternalServerErrorException(
      'Internal Server Error. Missing required authentication headers'
    );
  }

  const { status } = req.body;
  if (!status || (status != 'active' && status != 'inactive')) {
    throw new BadRequestException('Invalid status update request');
  }

  const user = await userRepository.getById(userId);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  try {
    const updatedUser = await userRepository.update(userId, {
      ...user,
      ...{ status: status },
    });

    if (!updatedUser) {
      throw new InternalServerErrorException('Failed to update User');
    }

    publishUserStatusUpdate({
      userId: userId,
      updatedData: { status: status },
    });

    return updatedUser;
  } catch (error) {
    throw new InternalServerErrorException(
      'Internal server error updating user status'
    );
  }
};
