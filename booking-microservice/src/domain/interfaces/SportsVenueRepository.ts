import { ClientSession } from 'mongoose';
import { SportsVenue } from '../entities/SportsVenue';

export interface ISportsVenueRepository {
  create(sportsVenue: SportsVenue): Promise<SportsVenue>;

  update(
    id: string,
    updatedData: Partial<SportsVenue>
  ): Promise<SportsVenue | null>;

  delete(id: string): Promise<SportsVenue | null>;

  findById(id: string): Promise<SportsVenue | null>;

  findAll(ownerId?: string): Promise<SportsVenue[]>;

  deleteManyByOwnerId(ownerId: string): Promise<number>;

  bulkDeleteByIds(
    venueIds: string[],
    session?: ClientSession
  ): Promise<{ deletedCount?: number }>;

  countSportsVenues(): Promise<number>;
}
