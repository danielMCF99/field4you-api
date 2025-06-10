import { sportsVenueRepository } from '../../app';
import mongoose from 'mongoose';
import { Request } from 'express';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';

export const getAllDistrictsByOwnerId = async (
  req: Request,

): Promise<string[]> => {

  const userId = req.headers['x-user-id'] as string | undefined;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new InternalServerErrorException('Invalid or missing user ID');
    }

  return await sportsVenueRepository.getAllDistrictsByOwnerId(userId);
};
