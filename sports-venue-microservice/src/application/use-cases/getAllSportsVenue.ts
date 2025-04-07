import { SportsVenue } from "../../domain/entities/sports-venue";
import { sportsVenueRepository } from "../../app";
import { InternalServerErrorException } from "../../domain/exceptions/InternalServerErrorException";

export const getAllSportsVenue = async (): Promise<SportsVenue[]> => {
  try {
    return await sportsVenueRepository.findAll();
  } catch (error) {
    throw new InternalServerErrorException("Error fetching Sports Venues");
  }
};
