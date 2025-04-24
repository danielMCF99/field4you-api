import { Request } from 'express';
import { sportsVenueRepository } from '../../app';
import { SportsVenue } from '../../domain/entities/SportsVenue';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';

export const getSportsVenueById = async (
  req: Request
): Promise<SportsVenue> => {
  const id = req.params.id.toString();
  const sportsVenue = await sportsVenueRepository.findById(id);
  if (!sportsVenue) {
    throw new NotFoundException('Sports Venue not found');
  }
  return sportsVenue;
};
