import { Request } from 'express';
import mongoose from 'mongoose';
import { userRepository } from '../../../app';
import { User } from '../../../domain/entities/User';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';

export const getById = async (req: Request): Promise<User> => {
  const id = req.params.id.toString();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }

  const user = await userRepository.getById(id);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user;
};
