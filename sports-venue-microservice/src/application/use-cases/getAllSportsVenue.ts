import { sportsVenueRepository } from '../../app';
import { SportsVenue } from '../../domain/entities/sports-venue';

export const getAllSportsVenue = async (): Promise<SportsVenue[]> => {
  return await sportsVenueRepository.findAll();
};
