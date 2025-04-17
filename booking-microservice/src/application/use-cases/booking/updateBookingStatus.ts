import { Request } from 'express';
import mongoose from 'mongoose';
import { bookingRepository } from '../../../app';
import { Booking } from '../../../domain/entities/Booking';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';

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
  if (
    !newStatus ||
    (newStatus != 'active' && newStatus != 'cancelled' && newStatus != 'done')
  ) {
    throw new BadRequestException('Invalid status update request');
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

  try {
    const updatedBooking = await bookingRepository.updateStatus(id, newStatus);
    if (!updatedBooking) {
      throw new InternalServerErrorException('Error updating booking');
    }

    return updatedBooking;
  } catch (error) {
    throw new InternalServerErrorException(
      'Internal server error updating booking'
    );
  }
};
