import { Request } from 'express';
import { sportsVenueRepository } from '../../app';
import { SportsVenue } from '../../domain/entities/SportsVenue';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import mongoose from 'mongoose';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';

export const getSportsVenueById = async (
  req: Request
): Promise<SportsVenue> => {
  const id = req.params.id.toString();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }
  const sportsVenue = await sportsVenueRepository.findById(id);
  if (!sportsVenue) {
    throw new NotFoundException('Sports Venue not found');
  }
  return sportsVenue;
};
