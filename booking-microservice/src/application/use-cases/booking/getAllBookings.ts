import { bookingRepository } from '../../../app';
import { Booking } from '../../../domain/entities/Booking';
import { BookingFilterParams } from '../../../domain/dtos/booking-filter.dto';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';

export const getAllBookings = async (queryParams: any): Promise<Booking[]> => {
  const {
    title,
    status,
    bookingType,
    bookingStartDate,
    bookingEndDate,
    sportsVenueId,
    limit,
    page,
  } = queryParams;

  try {
    const filters: BookingFilterParams = {
      title: title?.toString(),
      status: status?.toString(),
      sportsVenueId: sportsVenueId?.toString(),
      bookingType: bookingType?.toString(),
      bookingStartDate: bookingStartDate
        ? new Date(bookingStartDate)
        : undefined,
      bookingEndDate: bookingEndDate ? new Date(bookingEndDate) : undefined,
      limit: limit ? parseInt(limit) : 10,
      page: page ? parseInt(page) : 1,
    };

    return await bookingRepository.findAll(filters);
  } catch (error) {
    throw new InternalServerErrorException('Internal Server Error');
  }
};
