import { SportsVenueFilterParams } from '../dtos/sports-venue-filter.dto';
import { SportsVenue } from '../entities/SportsVenue';

export interface ISportsVenueRepository {
  create(sportsVenue: SportsVenue): Promise<SportsVenue>;

  update(
    id: string,
    updatedData: Partial<SportsVenue>
  ): Promise<SportsVenue | null>;

  delete(id: string): Promise<SportsVenue | null>;

  findById(id: string): Promise<SportsVenue | null>;
  
  findByOwnerId(id: string, params?: SportsVenueFilterParams): Promise<{ totalPages: number; sportsVenues: SportsVenue[] }>;

  findAll(
    params?: SportsVenueFilterParams
  ): Promise<{ totalPages: number; sportsVenues: SportsVenue[] }>;

  deleteManyByOwnerId(ownerId: string): Promise<number>;

  findByOwnerIdAndUpdate(
    ownerId: string,
    updatedData: Partial<SportsVenue>
  ): Promise<number>;
}
