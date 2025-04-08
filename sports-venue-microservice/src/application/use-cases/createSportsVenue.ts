import { Request } from 'express';
import { SportsVenue } from '../../domain/entities/sports-venue';
import { ISportsVenueRepository } from '../../domain/interfaces/SportsVenueRepository';
import { jwtHelper, sportsVenueRepository } from '../../app';
import { publishSportsVenueCreation } from '../../infrastructure/middlewares/rabbitmq.publisher';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';

export const createSportsVenue = async (req: Request): Promise<SportsVenue> => {
  try {
    const token = await jwtHelper.extractBearerToken(req);
    if (!token) {
      throw new UnauthorizedException('Authentication token is required');
    }

    const ownerId = await jwtHelper.verifyToken(token);
    if (!ownerId) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const {
      location,
      sportsVenueType,
      status,
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
      !status ||
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
      status,
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
