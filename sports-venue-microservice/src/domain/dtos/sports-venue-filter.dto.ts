import { SportsVenueStatus, SportsVenueType } from '../entities/SportsVenue';

export interface SportsVenueFilterParams {
  ownerId?: string;
  sportsVenueName?: string;
  status?: SportsVenueStatus;
  sportsVenueType?: SportsVenueType;
  page?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
  distance?: number;
  district?: string;
}
