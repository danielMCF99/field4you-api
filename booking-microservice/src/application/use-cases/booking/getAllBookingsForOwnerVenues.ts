import { Request } from 'express';
import { bookingRepository, sportsVenueRepository } from '../../../app';
import { BookingFilterParams } from '../../../domain/dtos/booking-filter.dto';
import {
  simpleBookingSchema,
  SimpleBookingsResponseDTO,
} from '../../../domain/dtos/booking-simple.dto';
import { BookingStatus } from '../../../domain/entities/Booking';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { SportsVenueFilterParams } from '../../../domain/dtos/sports-venue-filter.dto';

export const getAllBookingsForOwnerVenues = async (
  req: Request
): Promise<SimpleBookingsResponseDTO[]> => {
  const { status, bookingType, bookingStartDate, bookingEndDate } = req.query;

  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;

  const ownerId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;

  if (!ownerId || !userType) {
    throw new InternalServerErrorException(
      'Internal Server Error. Owner identification or user type header missing.'
    );
  }

  if (userType != 'Owner') {
    throw new ForbiddenException(
      'Regular users are not able to create a sports venue'
    );
  }

  try {
  
    const sportsVenueName = req.query.sportsVenueName?.toString();

    const venueFilters: SportsVenueFilterParams = {
      sportsVenueName: sportsVenueName,
    };

    // Get sports venue of authenticated owner
    const venues = await sportsVenueRepository.findAll(ownerId, venueFilters);
    const sportsVenueIds = venues.map((venue) => venue.getId());

    const filters: BookingFilterParams = {
      status: toBookingStatus(status),
      bookingType: bookingType?.toString(),
      bookingStartDate: bookingStartDate
        ? new Date(bookingStartDate as string)
        : undefined,
      bookingEndDate: bookingEndDate
        ? new Date(bookingEndDate as string)
        : undefined,
      limit: limit ? limit : 10,
      page: page ? page : 1,
    };

    // Get Bookings
    const bookings =
      await bookingRepository.findManyBySportsVenueIdsWithFilters(
        sportsVenueIds,
        filters
      );

    const result: SimpleBookingsResponseDTO[] = [];
    for (const booking of bookings) {
      const sportsVenue = await venues.filter(
        (elem) => elem.getId() === booking.sportsVenueId
      )[0];

      if (sportsVenue) {
        const dto: SimpleBookingsResponseDTO = {
          bookingId: booking.getId(),
          bookingType: booking.bookingType,
          bookingStartDate: booking.bookingStartDate,
          bookingEndDate: booking.bookingEndDate,
          bookingPrice: booking.bookingPrice,
          sportsVenueId: booking.sportsVenueId,
          sportsVenueName: sportsVenue.sportsVenueName,
          bookingStatus: booking.status,
        };

        simpleBookingSchema.parse(dto);
        result.push(dto);
      }
    }

    return result;
  } catch (error) {
    throw new InternalServerErrorException('Internal Server Error');
  }
};

function toBookingStatus(val: any): BookingStatus | undefined {
  if (Object.values(BookingStatus).includes(val)) {
    return val as BookingStatus;
  }
  return undefined; // ou lança exceção
}
