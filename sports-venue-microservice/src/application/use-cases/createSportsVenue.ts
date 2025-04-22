import { Request } from 'express';
import { ZodError } from 'zod';
import { sportsVenueRepository } from '../../app';
import {
  CreateSportsVenueDTO,
  createSportsVenueSchema,
} from '../../domain/dtos/create-sports-venue.dto';
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
      'Internal Server Error. Owner identification or user type header missing.'
    );
  }

  if (userType != 'owner') {
    throw new ForbiddenException(
      'Regular users are not able to create a sports venue'
    );
  }

  let parsed: CreateSportsVenueDTO;
  try {
    parsed = createSportsVenueSchema.parse(req.body);
  } catch (error) {
    if (error instanceof ZodError) {
      const missingFields = error.errors.map((err) => err.path.join('.'));
      throw new BadRequestException('Missing or invalid required fields', {
        missingFields,
      });
    }

    throw new InternalServerErrorException(
      'Unexpected error parsing request data'
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
  } = parsed;

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
    });

    return newSportsVenue;
  } catch (error) {
    throw new InternalServerErrorException(
      'Internal server error creating sports venue'
    );
  }
};
