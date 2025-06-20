import { Request } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { sportsVenueRepository } from '../../app';
import {
  UpdateSportsVenueDTO,
  updateSportsVenueSchema,
} from '../../domain/dtos/update-sports-venue.dto';
import { SportsVenue } from '../../domain/entities/SportsVenue';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { ForbiddenException } from '../../domain/exceptions/ForbiddenException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { publishSportsVenueUpdate } from '../../infrastructure/rabbitmq/rabbitmq.publisher';
import { getCoordinatesFromAddress } from '../../infrastructure/utils/getCoordinatesFromAddress';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';

export const updateSportsVenue = async (req: Request): Promise<SportsVenue> => {
  const id = req.params.id.toString();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }

  const ownerId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;

  if (!ownerId || !userType) {
    throw new UnauthorizedException(
      'Internal Server Error. Missing required authentication headers'
    );
  }

  const sportsVenue = await sportsVenueRepository.findById(id);
  if (!sportsVenue) {
    throw new NotFoundException('Sports Venue not found');
  }

  if (userType === 'User') {
    throw new ForbiddenException('User is not authorized to update this venue');
  }

  if (sportsVenue.ownerId != ownerId) {
    throw new ForbiddenException('User is not authorized to update this venue');
  }

  let parsed: UpdateSportsVenueDTO;
  try {
    parsed = updateSportsVenueSchema.parse(req.body);
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

  if (Object.keys(parsed).length === 0) {
    throw new BadRequestException(
      'At least one field must be provided for update'
    );
  }

  // Only update location if some of the fields have changed
  let locationCoords;
  const locationFields = ['district', 'city', 'address'];
  const locationUpdated = locationFields.every((field) => field in parsed);

  if (locationUpdated) {
    if (parsed.district && parsed.city && parsed.address) {
      console.log(parsed);
      try {
        locationCoords = await getCoordinatesFromAddress(
          parsed.address,
          parsed.city,
          parsed.district
        );
      } catch (err) {
        throw new BadRequestException(
          'Could not fetch coordinates for the new address'
        );
      }
    }
  }

  let updatedData = { ...parsed };

  try {
    let updatedSportsVenue;
    if (locationUpdated) {
      await sportsVenueRepository.update(id, { ...updatedData });
      const location = {
        district: parsed.district,
        city: parsed.city,
        address: parsed.address,
        latitude: locationCoords?.latitude,
        longitude: locationCoords?.longitude,
      };

      updatedSportsVenue = await sportsVenueRepository.update(id, {
        location: location,
      });
    } else {
      updatedSportsVenue = await sportsVenueRepository.update(id, {
        ...updatedData,
      });
    }

    if (!updatedSportsVenue) {
      throw new InternalServerErrorException('Failed to update Sports Venue');
    }
    publishSportsVenueUpdate({
      sportsVenueId: id,
      ownerId: sportsVenue.ownerId,
      updatedData,
    });

    return updatedSportsVenue;
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException(
      'Internal server error updating sports venue'
    );
  }
};
