import { Request } from 'express';
import { userRepository } from '../../../app';
import { User } from '../../../domain/entities/User';

export const getAll = async (req: Request): Promise<User[]> => {
  const users = await userRepository.getAll();
  return users;
};
