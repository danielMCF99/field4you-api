import { SportsVenue } from "../../domain/entities/sports-venue";
import { ISportsVenueRepository } from "../../domain/interfaces/SportsVenueRepository";

export const deleteSportsVenue = async (
  id: string,
  repository: ISportsVenueRepository
): Promise<SportsVenue | null> => {
  return await repository.delete(id);
};
