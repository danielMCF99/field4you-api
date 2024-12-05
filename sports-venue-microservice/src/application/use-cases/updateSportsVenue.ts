import { SportsVenue } from "../../domain/entities/sports-venue";
import { ISportsVenueRepository } from "../../domain/interfaces/SportsVenueRepository";

export const updateSportsVenue = async (
  id: string,
  updatedData: Partial<SportsVenue>,
  repository: ISportsVenueRepository
): Promise<SportsVenue | null> => {
  const updatedSportsVenue = await repository.update(id, updatedData);
  return updatedSportsVenue;
};
