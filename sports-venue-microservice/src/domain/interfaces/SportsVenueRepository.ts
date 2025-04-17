import { SportsVenue } from "../entities/sports-venue";
import { SportsVenueFilterParams } from "../dto/sports-venue-filter.dto";
export interface ISportsVenueRepository {
  create(sportsVenue: SportsVenue): Promise<SportsVenue>;
  update(id: string, updatedData: Partial<SportsVenue>): Promise<SportsVenue | null>;
  delete(id: string): Promise<SportsVenue | null>;
  findById(id: string): Promise<SportsVenue | null>;
  findAll(params?: SportsVenueFilterParams): Promise<SportsVenue[]>;
}