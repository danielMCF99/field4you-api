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
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { publishSportsVenueUpdate } from '../../infrastructure/rabbitmq/rabbitmq.publisher';
import { getCoordinatesFromAddress } from '../../infrastructure/utils/getCoordinatesFromAddress';

export const updateSportsVenue = async (req: Request): Promise<SportsVenue> => {
  const id = req.params.id.toString();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }

  const ownerId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;

  if (!ownerId || !userType) {
    throw new InternalServerErrorException(
      'Internal Server Error. Missing required authentication headers'
    );
  }

  if (userType != 'owner') {
    throw new ForbiddenException(
      'Regular User is not allowed to delete this venue'
    );
  }

  const sportsVenue = await sportsVenueRepository.findById(id);
  if (!sportsVenue) {
    throw new NotFoundException('Sports Venue not found');
  }
  if (sportsVenue.ownerId != ownerId) {
    throw new UnauthorizedException(
      'User is not authorized to update this venue'
    );
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

  const updatedData = { ...parsed };

  const updatedLocation = {
    district: updatedData.district ?? sportsVenue.location.district,
    city: updatedData.city ?? sportsVenue.location.city,
    address: updatedData.address ?? sportsVenue.location.address,
  };

  let locationCoords;

  if (updatedData.district || updatedData.city || updatedData.address) {
    try {
      locationCoords = await getCoordinatesFromAddress(
        updatedLocation.address,
        updatedLocation.city,
        updatedLocation.district
      );
    } catch (err) {
      console.log('Could not update coordinates:', err);
    }
  }

  if (locationCoords) {
    updatedData.location = {
      ...updatedLocation,
      latitude: locationCoords.latitude,
      longitude: locationCoords.longitude,
    };
  }

  try {
    const updatedSportsVenue = await sportsVenueRepository.update(id, {
      ...sportsVenue,
      ...updatedData,
    });

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
