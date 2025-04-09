import { Request } from 'express';
import mongoose from 'mongoose';
import { userRepository } from '../../app';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { publishUserDeletion } from '../../infrastructure/middlewares/rabbitmq.publisher';

export const deleteUser = async (req: Request): Promise<boolean> => {
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

  if (!(user.getId() != authUserId)) {
    throw new UnauthorizedException(
      "You don't have permission to edit this user"
    );
  }

  const deletedUser = await userRepository.delete(user.getId());
  if (!deletedUser) {
    throw new InternalServerErrorException(
      'Internal server error when deleting the user'
    );
  }

  await publishUserDeletion({ userId: id });

  return deletedUser;
};
