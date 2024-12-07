import { ISportsVenueRepository } from "../../domain/interfaces/SportsVenueRepository";
import { SportsVenue } from "../../domain/entities/sports-venue";

export const getAllSportsVenue = async(
    repository: ISportsVenueRepository
): Promise<SportsVenue[]> => {
    try{
        const allSportsVenue = await repository.findAll();
        return allSportsVenue;
    } catch (error) {
        return[];
    }
};