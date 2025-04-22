import { Request } from 'express';
import mongoose from 'mongoose';
import { bookingRepository, sportsVenueRepository } from '../../../app';
import { Booking, BookingStatus } from '../../../domain/entities/Booking';
import { SportsVenueStatus } from '../../../domain/entities/SportsVenue';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { ConflictException } from '../../../domain/exceptions/ConflictException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { createBookingInvite } from '../bookingInvite/createBookingInvite';
import { checkBookingConflicts } from './checkBookingConflicts';

export const createBooking = async (
  req: Request
): Promise<Booking | undefined> => {
  const ownerId = req.headers['x-user-id'] as string | undefined;
  if (!ownerId) {
    throw new InternalServerErrorException('Internal Server Error');
  }

  const {
    sportsVenueId,
    bookingType,
    title,
    bookingStartDate,
    bookingEndDate,
    isPublic,
    invitedUsersIds,
  } = req.body;

  if (!req) {
    throw new BadRequestException('Request body is required');
  }

  const requiredFields = {
    sportsVenueId,
    bookingType,
    title,
    bookingStartDate,
    bookingEndDate,
    isPublic,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    throw new BadRequestException('Missing required fields', { missingFields });
  }

  // Check if Sports Venue Exists
  const sportsVenue = await sportsVenueRepository.findById(sportsVenueId);
  if (!sportsVenue) {
    throw new NotFoundException('Sports Venue for given Booking not found');
  }

  // Check Sports Venue status
  if (sportsVenue.status != SportsVenueStatus.active) {
    throw new BadRequestException(
      'Unable to create booking. Chosen Sports Venue is inactive.'
    );
  }

  const hasConflicts = await checkBookingConflicts(
    bookingRepository,
    sportsVenueId,
    new Date(bookingStartDate),
    new Date(bookingEndDate),
    undefined
  );

  if (hasConflicts) {
    throw new ConflictException('Booking conflicts with existing bookings');
  }

  const booking = new Booking({
    sportsVenueId,
    bookingType,
    status: BookingStatus.active,
    title,
    bookingStartDate,
    bookingEndDate,
    isPublic,
    invitedUsersIds,
  });

  const formatedStartDate = new Date(booking.bookingStartDate);
  const formatedEndDate = new Date(booking.bookingEndDate);
  const now = new Date();

  if (formatedStartDate < now) {
    throw new BadRequestException('Booking start date cannot be in the past');
  }

  if (formatedEndDate <= formatedStartDate) {
    throw new BadRequestException('Booking end date must be after start date');
  }

  booking.ownerId = ownerId;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newBooking = await bookingRepository.create(booking, session);

    if (invitedUsersIds.length > 0) {
      await createBookingInvite(
        invitedUsersIds,
        {
          bookingId: newBooking.getId(),
          bookingStartDate: newBooking.bookingStartDate,
          bookingEndDate: newBooking.bookingEndDate,
        },
        session
      );
    }

    await session.commitTransaction();
    session.endSession();

    return newBooking;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);

    if (error instanceof NotFoundException) {
      throw new NotFoundException(error.message);
    }

    if (error instanceof BadRequestException) {
      throw new BadRequestException(error.message);
    }

    throw new InternalServerErrorException(
      'Internal server error creating booking'
    );
  }
};
