import { Request } from 'express';
import { sportsVenueRepository } from '../../app';
import { SportsVenue } from '../../domain/entities/sports-venue';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { ForbiddenException } from '../../domain/exceptions/ForbiddenException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { publishSportsVenueCreation } from '../../infrastructure/middlewares/rabbitmq.publisher';

export const createSportsVenue = async (req: Request): Promise<SportsVenue> => {
  const ownerId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;
  if (!ownerId || !userType) {
    throw new InternalServerErrorException('Internal Server Error');
  }

  if (userType != 'owner') {
    throw new ForbiddenException(
      'Regular users are not able to create a sports venue'
    );
  }

  try {
    const {
      location,
      sportsVenueType,
      sportsVenueName,
      bookingMinDuration,
      bookingMinPrice,
      sportsVenuePicture,
      hasParking,
      hasShower,
      hasBar,
    } = req.body;

    if (
      !location ||
      !sportsVenueType ||
      !sportsVenueName ||
      !bookingMinDuration ||
      !bookingMinPrice ||
      !sportsVenuePicture
    ) {
      throw new BadRequestException('Missing required fields');
    }

    const sportsVenue = new SportsVenue({
      ownerId,
      location,
      sportsVenueType,
      status: 'inactive',
      sportsVenueName,
      bookingMinDuration,
      bookingMinPrice,
      sportsVenuePicture,
      hasParking,
      hasShower,
      hasBar,
    });

    const newSportsVenue = await sportsVenueRepository.create(sportsVenue);
    if (!newSportsVenue) {
      throw new InternalServerErrorException('Failed to create sports venue');
    }

    await publishSportsVenueCreation({
      sportsVenueId: newSportsVenue.getId(),
      ownerId: ownerId,
      location: newSportsVenue.location,
      sportsVenueType: newSportsVenue.sportsVenueType,
      status: newSportsVenue.status,
      sportsVenueName: newSportsVenue.sportsVenueName,
      bookingMinDuration: newSportsVenue.bookingMinDuration,
      bookingMinPrice: newSportsVenue.bookingMinPrice,
      sportsVenuePicture: newSportsVenue.sportsVenuePicture,
      hasParking: newSportsVenue.hasParking,
      hasShower: newSportsVenue.hasShower,
      hasBar: newSportsVenue.hasBar,
    });
    return newSportsVenue;
  } catch (error: any) {
    if (error instanceof UnauthorizedException) {
      throw new UnauthorizedException(error.message);
    } else if (error instanceof BadRequestException) {
      throw new BadRequestException(error.message);
    }
    throw new InternalServerErrorException('Internal Server Error');
  }
};
