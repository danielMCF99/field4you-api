import { SportsVenue } from "../../../domain/entities/SportsVenue";
import { sportsVenueRepository } from "../../../app";

export const updateSportsVenue = async (
  id: string,
  updatedData: Partial<SportsVenue>
): Promise<SportsVenue | undefined> => {
  try {
    const sportsVenue = await sportsVenueRepository.update(id, updatedData);
    if (!sportsVenue) {
      return undefined;
    }
    return sportsVenue;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
