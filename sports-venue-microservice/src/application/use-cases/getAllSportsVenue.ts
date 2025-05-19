import { sportsVenueRepository } from '../../app';
import { SportsVenue } from '../../domain/entities/SportsVenue';
import { SportsVenueFilterParams } from '../../domain/dtos/sports-venue-filter.dto';

export const getAllSportsVenue = async (query: any): Promise<SportsVenue[]> => {
  const filters: SportsVenueFilterParams = {
    ownerId: query.ownerId?.toString(),
    sportsVenueName: query.sportsVenueName?.toString(),
    status: query.status?.toString(),
    sportsVenueType: query.sportsVenueType?.toString(),
    page: query.page ? parseInt(query.page.toString(), 10) : 1,
    limit: query.limit ? parseInt(query.limit.toString(), 10) : 10,
    latitude: query.latitude ? parseFloat(query.latitude) : undefined,
    longitude: query.longitude ? parseFloat(query.longitude) : undefined,
    distance: query.distance ? parseInt(query.distance, 10) : undefined,
  };

  return await sportsVenueRepository.findAll(filters);
};
