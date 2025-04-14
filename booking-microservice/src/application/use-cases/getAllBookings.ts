import { bookingRepository } from '../../app';
import { Booking } from '../../domain/entities/Booking';
import { BookingFilterParams } from '../../domain/dto/booking-filter.dto';

export const getAllBookings = async (
  params: BookingFilterParams
): Promise<Booking[]> => {
  return await bookingRepository.findAll(params);
};
