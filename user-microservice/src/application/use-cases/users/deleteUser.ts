import { Request } from 'express';
import mongoose from 'mongoose';
import { userRepository } from '../../../app';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { publishUserDeletion } from '../../../infrastructure/rabbitmq/rabbitmq.publisher';

export const deleteUser = async (req: Request): Promise<boolean> => {
  const id = req.params.id.toString();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }

  const authUserId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;
  if (!authUserId || !userType) {
    throw new InternalServerErrorException('Internal Server Error');
  }

  if (userType != 'admin') {
    throw new ForbiddenException(
      'Only admin users are allowed to delete users'
    );
  }

  const user = await userRepository.getById(id);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  try {
    const deletedUser = await userRepository.delete(user.getId());
    publishUserDeletion({ userId: id });

    return deletedUser;
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException(
      'Internal server error deleting user'
    );
  }
};
