import { Request } from 'express';
import mongoose from 'mongoose';
import { bookingRepository } from '../../app';
import { Booking } from '../../domain/entities/Booking';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';

export const getBookingById = async (req: Request): Promise<Booking> => {
  const id = req.params.id.toString();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }

  try {
    const booking = await bookingRepository.findById(id);

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }
    return booking;
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw new BadRequestException('Booking not found');
    } else {
      throw new InternalServerErrorException('Error fetching booking');
    }
  }
};
