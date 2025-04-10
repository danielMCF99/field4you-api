import { Request } from 'express';
import { bookingRepository } from '../../app';
import { Booking } from '../../domain/entities/Booking';

export const getAllBookings = async (req: Request): Promise<Booking[]> => {
  const allBookings = await bookingRepository.findAll();
  return allBookings;
};
