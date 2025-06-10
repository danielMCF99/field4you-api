import { Request } from 'express';
import { sportsVenueRepository } from '../../app';
import { SportsVenue } from '../../domain/entities/SportsVenue';
import { SportsVenueFilterParams } from '../../domain/dtos/sports-venue-filter.dto';
import mongoose from 'mongoose';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';

export const getSportsVenueByOwnerId = async (
  query: any,
  req: Request
): Promise<{ totalPages: number; sportsVenues: SportsVenue[] }> => {
  const userId = req.headers['x-user-id'] as string | undefined;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new InternalServerErrorException('Invalid or missing user ID');
  }

  const filters: SportsVenueFilterParams = {
    sportsVenueName: query.sportsVenueName?.toString(),
    status: query.status?.toString(),
    page: query.page ? parseInt(query.page.toString(), 10) : 1,
    limit: query.limit ? parseInt(query.limit.toString(), 10) : 10,
    district: query.district?.toString(),
  };

  // Usar el repositorio con los filtros
  const result = await sportsVenueRepository.findByOwnerId(userId, filters);
  
  if (!result) {
    throw new InternalServerErrorException('Failed to retrieve sports venues');
  }

  return result;
};