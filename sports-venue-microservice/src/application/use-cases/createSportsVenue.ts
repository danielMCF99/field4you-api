import { Request } from 'express';
import { sportsVenueRepository } from '../../app';
import {
  SportsVenue,
  SportsVenueStatus,
} from '../../domain/entities/sports-venue';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { ForbiddenException } from '../../domain/exceptions/ForbiddenException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { publishSportsVenueCreation } from '../../infrastructure/middlewares/rabbitmq.publisher';

export const createSportsVenue = async (req: Request): Promise<SportsVenue> => {
  const ownerId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;
  if (!ownerId || !userType) {
    throw new InternalServerErrorException(
      'Internal Server Error. Missing required authentication headers'
    );
  }

  if (userType != 'owner') {
    throw new ForbiddenException(
      'Regular users are not able to create a sports venue'
    );
  }

  const {
    sportsVenueType,
    sportsVenueName,
    bookingMinDuration,
    bookingMinPrice,
    sportsVenuePicture,
    hasParking,
    hasShower,
    hasBar,
    district,
    city,
    address,
  } = req.body;

  const requiredFields = {
    sportsVenueType,
    sportsVenueName,
    bookingMinDuration,
    bookingMinPrice,
    sportsVenuePicture,
    district,
    city,
    address,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    throw new BadRequestException('Missing required fields', { missingFields });
  }

  const sportsVenue = new SportsVenue({
    ownerId,
    sportsVenueType,
    status: SportsVenueStatus.inactive,
    sportsVenueName,
    bookingMinDuration,
    bookingMinPrice,
    sportsVenuePicture,
    hasParking,
    hasShower,
    hasBar,
    location: {
      district,
      city,
      address,
    },
  });

  try {
    const newSportsVenue = await sportsVenueRepository.create(sportsVenue);
    if (!newSportsVenue) {
      throw new InternalServerErrorException('Failed to create sports venue');
    }

    publishSportsVenueCreation({
      sportsVenueId: newSportsVenue.getId(),
      ownerId: ownerId,
      sportsVenueType: newSportsVenue.sportsVenueType,
      status: newSportsVenue.status,
      sportsVenueName: newSportsVenue.sportsVenueName,
      bookingMinDuration: newSportsVenue.bookingMinDuration,
      bookingMinPrice: newSportsVenue.bookingMinPrice,
      sportsVenuePicture: newSportsVenue.sportsVenuePicture,
      hasParking: newSportsVenue.hasParking,
      hasShower: newSportsVenue.hasShower,
      hasBar: newSportsVenue.hasBar,
      location: newSportsVenue.getLocation(),
    });

    return newSportsVenue;
  } catch (error) {
    throw new InternalServerErrorException(
      'Internal server error creating sports venue'
    );
  }
};
