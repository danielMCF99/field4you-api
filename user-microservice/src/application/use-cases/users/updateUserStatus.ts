import { Request } from 'express';
import { userRepository } from '../../../app';
import { User, UserStatus, UserType } from '../../../domain/entities/User';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../../domain/exceptions/UnauthorizedException';
import { publishUserStatusUpdate } from '../../../infrastructure/rabbitmq/rabbitmq.publisher';

export const updateUserStatus = async (req: Request): Promise<User> => {
  const userType = req.headers['x-user-type'] as string | undefined;
  const authenticatedUserId = req.headers['x-user-id'] as string | undefined;
  if (!authenticatedUserId) {
    throw new InternalServerErrorException(
      'Internal Server Error. Missing required authentication headers'
    );
  }

  const { status, userId } = req.body;
  if (!status || (status != 'Active' && status != 'Inactive')) {
    throw new BadRequestException('Invalid status update request');
  }

  let user;
  if (userId) {
    if (userType != UserType.admin) {
      throw new UnauthorizedException(
        'Regular user can only update its own status'
      );
    }

    user = await userRepository.getById(userId);
  } else {
    user = await userRepository.getById(authenticatedUserId);
  }

  if (!user) {
    throw new NotFoundException('User not found');
  }

  try {
    const updatedUser = await userRepository.update(user.getId(), {
      status: status,
    });

    if (!updatedUser) {
      throw new InternalServerErrorException('Failed to update User');
    }

    publishUserStatusUpdate({
      userId: userId ? userId : authenticatedUserId,
      status: status as UserStatus,
    });

    return updatedUser;
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException(
      'Internal server error updating user status'
    );
  }
};
