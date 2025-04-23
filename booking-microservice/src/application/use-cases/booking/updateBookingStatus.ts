import { Request } from 'express';
import mongoose from 'mongoose';
import { bookingRepository } from '../../../app';
import { Booking, BookingStatus } from '../../../domain/entities/Booking';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { ConflictException } from '../../../domain/exceptions/ConflictException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { checkBookingConflicts } from './checkBookingConflicts';
import { UnauthorizedException } from '../../../domain/exceptions/UnauthorizedException';
import { validateBookingStatusTransition } from '../../../infrastructure/utils/bookingUtils';

export const updateBookingStatus = async (req: Request): Promise<Booking> => {
  const id = req.params.id.toString();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }

  const allowedFields = ['status'];

  const updatedData: Record<string, any> = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updatedData[key] = req.body[key];
    }
  });

  const newStatus = updatedData.status;
  const validStatus = [
    BookingStatus.active,
    BookingStatus.cancelled,
    BookingStatus.done,
  ];
  if (!newStatus || !validStatus.includes(newStatus)) {
    throw new BadRequestException('Invalid status update request');
  }

  const ownerId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;

  if (!ownerId || !userType) {
    throw new InternalServerErrorException(
      'Internal Server Error. Missing required authentication headers'
    );
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

  if (booking.bookingEndDate < new Date()) {
    throw new UnauthorizedException(
      'Not allowed to update booking that is done'
    );
  }

  const isValidStatusTransition = validateBookingStatusTransition(
    booking.status,
    newStatus
  );
  if (!isValidStatusTransition) {
    throw new BadRequestException('Invalid status transition');
  }

  // Check for potential conflicts when activating a Booking
  if (newStatus == BookingStatus.active) {
    const hasConflicts = await checkBookingConflicts(
      bookingRepository,
      booking.sportsVenueId,
      booking.bookingStartDate,
      booking.bookingEndDate,
      booking.getId()
    );

    if (hasConflicts) {
      throw new ConflictException('Booking conflicts with existing bookings');
    }
  }

  try {
    const updatedBooking = await bookingRepository.updateStatus(id, newStatus);
    if (!updatedBooking) {
      throw new InternalServerErrorException('Error updating booking');
    }

    return updatedBooking;
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException(
      'Internal server error updating booking'
    );
  }
};
