import { Request } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { bookingInviteRepository, sportsVenueRepository } from '../../app';
import {
  UpdateSportsVenueRatingDTO,
  updateSportsVenueRatingSchema,
} from '../../domain/dtos/update-sports-venue-rating.dto';
import { SportsVenue } from '../../domain/entities/SportsVenue';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { publishSportsVenueUpdate } from '../../infrastructure/rabbitmq/rabbitmq.publisher';

export const updateSportsVenueRating = async (
  req: Request
): Promise<SportsVenue> => {
  const id = req.params.id.toString();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }

  const userId = req.headers['x-user-id'] as string | undefined;

  if (!userId) {
    throw new InternalServerErrorException(
      'Internal Server Error. Missing required authentication headers'
    );
  }

  const sportsVenue = await sportsVenueRepository.findById(id);
  if (!sportsVenue) {
    throw new NotFoundException('Sports Venue not found');
  }

  let parsed: UpdateSportsVenueRatingDTO;
  try {
    parsed = updateSportsVenueRatingSchema.parse(req.body);
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

  if (!parsed.bookingId) {
    throw new BadRequestException('Booking id must be sent');
  }

  if (!mongoose.Types.ObjectId.isValid(parsed.bookingId)) {
    throw new BadRequestException('Invalid ID format');
  }

  // Check if user is allowed to give rating
  const existisBookingInvite =
    await bookingInviteRepository.existsBySportsVenueIdAndUserId(id, userId);

  if (!existisBookingInvite) {
    throw new NotFoundException('User was not invited for given booking');
  }

  let updatedData;
  if (parsed.rating !== undefined) {
    const numberOfRatings = (sportsVenue.numberOfRatings || 0) + 1;
    console.log(`Number of existing ratings: ${numberOfRatings}`);
    if (numberOfRatings != 1) {
      parsed.rating = ((sportsVenue.rating || 0) + parsed.rating) / 2;
      console.log(
        `New rating: ${((sportsVenue.rating || 0) + parsed.rating) / 2}`
      );
    }
    updatedData = { ...parsed, numberOfRatings: numberOfRatings };
  } else {
    updatedData = { ...parsed };
  }

  try {
    const updatedSportsVenue = await sportsVenueRepository.update(id, {
      ...sportsVenue,
      ...updatedData,
    });

    if (!updatedSportsVenue) {
      throw new InternalServerErrorException('Failed to update Sports Venue');
    }

    bookingInviteRepository.deleteByUserIdAndBookingIdAndSportsVenueId(
      userId,
      parsed.bookingId,
      id
    );

    publishSportsVenueUpdate({
      sportsVenueId: id,
      ownerId: sportsVenue.ownerId,
      updatedData,
    });

    return updatedSportsVenue;
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException(
      'Internal server error updating sports venue rating'
    );
  }
};
