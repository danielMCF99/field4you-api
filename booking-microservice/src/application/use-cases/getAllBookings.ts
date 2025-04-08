import { Request } from 'express';
import { bookingRepository } from '../../app';
import { Booking } from '../../domain/entities/Booking';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';

export const getAllBookings = async (req: Request): Promise<Booking[]> => {
  try {
    const allBookings = await bookingRepository.findAll();
    return allBookings;
  } catch (error) {
    throw new InternalServerErrorException('Error getting all bookings');
  }
};
