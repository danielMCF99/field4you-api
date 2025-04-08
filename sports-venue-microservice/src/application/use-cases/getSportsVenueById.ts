import { Request } from 'express';
import { sportsVenueRepository } from '../../app';
import { SportsVenue } from '../../domain/entities/sports-venue';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';

export const getSportsVenueById = async (
  req: Request
): Promise<SportsVenue> => {
  try {
    const id = req.params.id.toString();
    const sportsVenue = await sportsVenueRepository.findById(id);
    if (!sportsVenue) {
      throw new NotFoundException('Sports Venue not found');
    }
    return sportsVenue;
  } catch (error) {
    throw new InternalServerErrorException('Error fetching Sports Venue by ID');
  }
};
