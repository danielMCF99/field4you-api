import { Request } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { getDay, format } from 'date-fns';
import { bookingRepository, sportsVenueRepository } from '../../../app';
import {
  CreateBookingDTO,
  createBookingSchema,
} from '../../../domain/dtos/create-booking.dto';
import { Booking, BookingStatus } from '../../../domain/entities/Booking';
import {
  DayOfWeek,
  SportsVenueStatus,
} from '../../../domain/entities/SportsVenue';
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
    throw new InternalServerErrorException('Missing user-id header');
  }

  let parsed: CreateBookingDTO;
  try {
    parsed = createBookingSchema.parse(req.body);
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
    sportsVenueId,
    bookingType,
    title,
    bookingStartDate,
    bookingEndDate,
    isPublic,
    invitedUsersIds,
  } = parsed;

  const sportsVenue = await sportsVenueRepository.findById(sportsVenueId);
  if (!sportsVenue) {
    throw new NotFoundException('Sports Venue for given Booking not found');
  }

  if (sportsVenue.status != SportsVenueStatus.active) {
    throw new BadRequestException(
      'Unable to create booking. Chosen Sports Venue is inactive.'
    );
  }

  const startDate = new Date(bookingStartDate);
  const endDate = new Date(bookingEndDate);
  const now = new Date();
  if (startDate < now) {
    throw new BadRequestException('Booking start date cannot be in the past');
  }

  if (endDate <= startDate) {
    throw new BadRequestException('Booking end date must be after start date');
  }

  const hasConflicts = await checkBookingConflicts(
    bookingRepository,
    sportsVenueId,
    startDate,
    endDate,
    undefined
  );

  if (hasConflicts) {
    throw new ConflictException('Booking conflicts with existing bookings');
  }

  const diffInMinutes = Math.floor(
    (endDate.getTime() - startDate.getTime()) / 60000
  );

  if (diffInMinutes < sportsVenue.bookingMinDuration) {
    throw new BadRequestException(
      'Booking duration must be higher to fulfill given Sports Venue Booking minimum time constraint'
    );
  }

  const dayOfWeekMap = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const dayOfWeek = dayOfWeekMap[startDate.getDay()];
  const availableSlots = sportsVenue.weeklySchedule?.[dayOfWeek as DayOfWeek];

  if (!availableSlots || availableSlots.length === 0) {
    throw new BadRequestException('No available slots for the selected day');
  }

  const bookingStartHour = format(startDate, 'HH:mm');
  const bookingEndHour = format(endDate, 'HH:mm');

  const isInsideSlot = availableSlots.some(
    (slot: { startTime: string; endTime: string }) => {
      return (
        bookingStartHour >= slot.startTime && bookingEndHour <= slot.endTime
      );
    }
  );

  if (!isInsideSlot) {
    throw new BadRequestException('Booking times are outside allowed schedule');
  }

  const booking = new Booking({
    sportsVenueId,
    bookingType,
    status: BookingStatus.active,
    title,
    bookingStartDate: startDate,
    bookingEndDate: endDate,
    bookingPrice:
      (diffInMinutes / sportsVenue.bookingMinDuration) *
      sportsVenue.bookingMinPrice,
    isPublic,
    invitedUsersIds,
  });

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

    // Commit DB Transaction
    await session.commitTransaction();
    session.endSession();

    return newBooking;
  } catch (error: any) {
    // Abort DB Transaction
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
