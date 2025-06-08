import { Request } from 'express';
import { sportsVenueRepository } from '../../app';
import { SportsVenue } from '../../domain/entities/SportsVenue';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import mongoose from 'mongoose';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';

export const getSportsVenueByOwnerId = async (
  req: Request
): Promise<SportsVenue []> => {
  const ownerId = req.params.id.toString();
  if (!mongoose.Types.ObjectId.isValid(ownerId)) {
    throw new BadRequestException('Invalid ID format');
  }
  const sportsVenue = await sportsVenueRepository.findByOwnerId(ownerId);
  if (!sportsVenue.length) {
    throw new NotFoundException('No Sports Venues found for this owner');
  }
  return sportsVenue;
};