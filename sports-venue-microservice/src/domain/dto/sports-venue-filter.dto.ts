import { SportsVenueStatus, SportsVenueType } from '../entities/sports-venue';

export interface SportsVenueFilterParams {
  sportsVenueName?: string;
  status?: SportsVenueStatus;
  sportsVenueType?: SportsVenueType;
  page?: number;
  limit?: number;
}
