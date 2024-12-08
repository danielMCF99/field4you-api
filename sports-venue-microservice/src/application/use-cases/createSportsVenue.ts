import { SportsVenue } from "../../domain/entities/sports-venue";
import { ISportsVenueRepository } from "../../domain/interfaces/SportsVenueRepository";
import { jwtHelper } from "../../app";

export const createSportsVenue = async (
  token: string,
  sportsVenue: SportsVenue,
  repository: ISportsVenueRepository
) => {
  try{
    const ownerId = await jwtHelper.verifyToken(token);
    if (!ownerId) {
      return undefined
    }
    sportsVenue.ownerId = ownerId;
    const newSportsVenue = await repository.create(sportsVenue);
    return newSportsVenue;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
