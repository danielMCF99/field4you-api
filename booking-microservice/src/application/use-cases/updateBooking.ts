import { Request } from 'express';
import { Booking } from '../../domain/entities/Booking';
import { bookingRepository } from '../../app';
import { checkBookingConflicts } from './checkBookingConflicts';
import mongoose from 'mongoose';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { ConflictException } from '../../domain/exceptions/ConflictException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';

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
    const booking = await bookingRepository.findByIdAndOwnerId(id, ownerId);
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

  try {
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

    if (isSportsVenueIdChanged || isStartDateChanged || isEndDateChanged) {
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
    const updatedBooking = await bookingRepository.update(booking.getId(), {
      ...updatedData,
    });
    console.log('Updated booking info');
    if (!updatedBooking) {
      throw new BadRequestException('Error updating booking');
    }
    return updatedBooking;
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      throw new UnauthorizedException(error.message);
    } else if (error instanceof BadRequestException) {
      throw new BadRequestException(error.message);
    } else if (error instanceof ConflictException) {
      throw new ConflictException(error.message);
    } else {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
};
