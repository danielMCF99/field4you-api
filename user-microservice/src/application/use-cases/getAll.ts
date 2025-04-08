import { Request } from 'express';
import { userRepository } from '../../app';
import { User } from '../../domain/entities/User';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';

export const getAll = async (req: Request): Promise<User[]> => {
  try {
    const users = await userRepository.getAll();
    return users;
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};
