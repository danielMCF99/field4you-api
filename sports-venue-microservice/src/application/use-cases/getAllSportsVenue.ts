import { sportsVenueRepository } from '../../app';
import { SportsVenue } from '../../domain/entities/sports-venue';
import { SportsVenueFilterParams } from '../../domain/dto/sports-venue-filter.dto';

export const getAllSportsVenue = async (
  params: SportsVenueFilterParams
): Promise<SportsVenue[]> => {
  return await sportsVenueRepository.findAll(params);
};