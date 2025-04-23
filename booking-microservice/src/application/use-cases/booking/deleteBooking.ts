import { Request } from 'express';
import mongoose from 'mongoose';
import { bookingRepository } from '../../../app';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';

export const deleteBooking = async (req: Request): Promise<Boolean> => {
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

  if (userType != 'admin') {
    throw new ForbiddenException(
      'Only admin users are allowed to delete bookings'
    );
  }

  // Check if booking belongs to the user
  const booking = await bookingRepository.findById(id);
  if (!booking) {
    throw new NotFoundException('Booking not found');
  }

  try {
    const isDeleted = await bookingRepository.delete(id);
    return isDeleted;
  } catch (error) {
    throw new InternalServerErrorException(
      'Internal server error deleting booking'
    );
  }
};
