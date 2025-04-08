import { SportsVenue } from '../../../domain/entities/SportsVenue';
import { sportsVenueRepository } from '../../../app';

export const deleteSportsVenue = async (
  id: string
): Promise<SportsVenue | null> => {
  try {
    return await sportsVenueRepository.delete(id);
  } catch (error) {
    console.error(error);
    return null;
  }
};
