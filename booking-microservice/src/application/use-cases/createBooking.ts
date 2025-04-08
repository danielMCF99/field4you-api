import { Request } from 'express';
import mongoose from 'mongoose';
import { bookingRepository } from '../../app';
import { Booking } from '../../domain/entities/Booking';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { ConflictException } from '../../domain/exceptions/ConflictException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
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
    status,
    title,
    bookingStartDate,
    bookingEndDate,
    isPublic,
    invitedUsersIds,
  } = req.body;

  if (!req) {
    throw new BadRequestException('Request body is required');
  }

  if (
    !sportsVenueId ||
    !bookingType ||
    !status ||
    !title ||
    !bookingStartDate ||
    !bookingEndDate ||
    !isPublic
  ) {
    throw new BadRequestException('Missing required fields');
  }

  try {
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
      status,
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
      throw new BadRequestException(
        'Booking end date must be after start date'
      );
    }

    const invalidIds = invitedUsersIds.filter(
      (id: string) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      throw new BadRequestException('Invalid user IDs');
    }

    // TO DO: Check if Sports Venue Exists
    booking.ownerId = ownerId;

    const newBooking = await bookingRepository.create(booking);
    if (!newBooking) {
      throw new BadRequestException('Failed to create booking');
    }

    return newBooking;
  } catch (error: any) {
    if (error instanceof BadRequestException) {
      throw new BadRequestException(error.message);
    } else if (error instanceof ConflictException) {
      throw new ConflictException(error.message);
    } else {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
};
