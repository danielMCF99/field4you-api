import { SportsVenue } from "../entities/sports-venue";

export interface ISportsVenueRepository {
  create(sportsVenue: SportsVenue): Promise<SportsVenue>;
  update(id: string, updatedData: Partial<SportsVenue>): Promise<SportsVenue | null>;
  delete(id: string): Promise<SportsVenue | null>;
  findById(id: string): Promise<SportsVenue | null>;
}