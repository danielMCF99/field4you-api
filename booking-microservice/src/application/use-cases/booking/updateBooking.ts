import { Request } from 'express';
import mongoose from 'mongoose';
import {
  bookingRepository,
  sportsVenueRepository,
  userRepository,
} from '../../../app';
import { Booking } from '../../../domain/entities/Booking';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { ConflictException } from '../../../domain/exceptions/ConflictException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { checkBookingConflicts } from './checkBookingConflicts';

export const updateBooking = async (req: Request): Promise<Booking> => {
  const id = req.params.id.toString();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }

  const ownerId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;
  if (!ownerId || !userType) {
    throw new InternalServerErrorException('Internal Server Error');
  }

  let booking;
  if (userType != 'admin') {
    // Check if booking belongs to the user
    booking = await bookingRepository.findByIdAndOwnerId(id, ownerId);
    if (!booking) {
      throw new NotFoundException(
        'Booking with given ID not found for authenticated user'
      );
    }
  } else {
    booking = await bookingRepository.findById(id);
  }

  if (!booking) {
    throw new NotFoundException('Booking not found');
  }

  const allowedFields = [
    'bookingType',
    'title',
    'bookingStartDate',
    'bookingEndDate',
    'isPublic',
    'invitedUsersIds',
  ];

  const updatedData: Record<string, any> = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updatedData[key] = req.body[key];
    }
  });
  const isSportsVenueIdChanged =
    updatedData.sportsVenueId &&
    updatedData.sportsVenueId !== booking.sportsVenueId;
  const isStartDateChanged =
    updatedData.bookingStartDate &&
    new Date(updatedData.bookingStartDate).getTime() !==
      new Date(booking.bookingStartDate).getTime();
  const isEndDateChanged =
    updatedData.bookingEndDate &&
    new Date(updatedData.bookingEndDate).getTime() !==
      new Date(booking.bookingEndDate).getTime();

  if (isSportsVenueIdChanged) {
    // Check if Sports Venue Exists
    const sportsVenue = await sportsVenueRepository.findById(
      updatedData.sportsVenueId
    );
    if (!sportsVenue) {
      throw new NotFoundException('Sports Venue for given Booking not found');
    }

    if (isStartDateChanged || isEndDateChanged) {
      const hasConflicts = await checkBookingConflicts(
        bookingRepository,
        updatedData.sportsVenueId || booking.sportsVenueId,
        new Date(updatedData.bookingStartDate || booking.bookingStartDate),
        new Date(updatedData.bookingEndDate || booking.bookingEndDate),
        id
      );

      if (hasConflicts) {
        throw new ConflictException('Booking conflicts found');
      }
    }
  }

  // Check invited user ids
  const invitedUsersIds = updatedData.invitedUsersIds;
  if (invitedUsersIds) {
    const invalidIds = invitedUsersIds.some(
      (id: string) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length) {
      throw new BadRequestException('Invalid user IDs');
    }

    // Check if any of the invited users does not exist
    const nonExistingUsers = await Promise.all(
      invitedUsersIds.map(async (id: string) => {
        const user = await userRepository.getById(id);
        return user === undefined;
      })
    );

    const hasNonExistingUsers = nonExistingUsers.some((val) => val === true);
    if (hasNonExistingUsers) {
      throw new NotFoundException(
        'You have invited at least one user that does not exist'
      );
    }
  }

  try {
    const updatedBooking = await bookingRepository.update(booking.getId(), {
      ...updatedData,
    });
    if (!updatedBooking) {
      throw new InternalServerErrorException('Error updating booking');
    }

    return updatedBooking;
  } catch (error) {
    throw new InternalServerErrorException(
      'Internal server error deleting booking'
    );
  }
};
