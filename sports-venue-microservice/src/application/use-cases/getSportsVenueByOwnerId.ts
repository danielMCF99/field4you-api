import { Request } from 'express';
import { sportsVenueRepository } from '../../app';
import { SportsVenue } from '../../domain/entities/SportsVenue';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import mongoose from 'mongoose';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';

export const getSportsVenueByOwnerId = async (
  req: Request
): Promise<SportsVenue []> => {

  const userId = req.headers['x-user-id'] as string | undefined;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new InternalServerErrorException('Internal Server Error. user id header missing.');
  }
  const sportsVenue = await sportsVenueRepository.findByOwnerId(userId);
  
  return sportsVenue;
};