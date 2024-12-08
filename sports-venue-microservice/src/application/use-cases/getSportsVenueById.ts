import { SportsVenue } from '../../domain/entities/sports-venue';
import { ISportsVenueRepository } from '../../domain/interfaces/SportsVenueRepository';

export const getSportsVenueById = async (
  id: string,
  repository: ISportsVenueRepository
): Promise<SportsVenue | null> => {
  return await repository.findById(id);
};
