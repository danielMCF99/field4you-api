import { Request } from 'express';
import { bookingRepository, sportsVenueRepository } from '../../../app';
import { BookingFilterParams } from '../../../domain/dtos/booking-filter.dto';
import {
  simpleBookingSchema,
  SimpleBookingsResponseDTO,
} from '../../../domain/dtos/booking-simple.dto';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';

export const getSimpleBookingsInfo = async (
  req: Request,
  queryParams: any
): Promise<SimpleBookingsResponseDTO[]> => {
  const authenticatedUserId = req.headers['x-user-id'] as string | undefined;

  if (!authenticatedUserId) {
    throw new InternalServerErrorException(
      'Internal Server Error. Missing required authentication headers'
    );
  }

  const { status, bookingStartDate, bookingEndDate, limit, page } = queryParams;

  try {
    const filters: BookingFilterParams = {
      status: status?.toString(),
      bookingStartDate: bookingStartDate
        ? new Date(bookingStartDate)
        : undefined,
      bookingEndDate: bookingEndDate ? new Date(bookingEndDate) : undefined,
      limit: limit ? parseInt(limit) : 10,
      page: page ? parseInt(page) : 1,
    };

    const bookings = await bookingRepository.findAll(
      filters,
      undefined,
      'bookingStartDate',
      'asc'
    );

    const result: SimpleBookingsResponseDTO[] = [];

    for (const booking of bookings) {
      const sportsVenue = await sportsVenueRepository.findById(
        booking.sportsVenueId
      );

      if (sportsVenue) {
        const dto: SimpleBookingsResponseDTO = {
          bookingId: booking.getId(),
          bookingStartDate: booking.bookingStartDate,
          bookingEndDate: booking.bookingEndDate,
          bookingPrice: booking.bookingPrice,
          sportsVenueId: booking.sportsVenueId,
          sportsVenueName: sportsVenue.sportsVenueName,
        };

        // Opcional: valida com zod (lança erro se estiver inválido)
        simpleBookingSchema.parse(dto);

        result.push(dto);
      }
    }

    return result;
  } catch (error) {
    throw new InternalServerErrorException('Internal Server Error');
  }
};
