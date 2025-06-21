import { Request } from 'express';
import {
  bookingInviteRepository,
  bookingRepository,
  sportsVenueRepository,
} from '../../../app';
import {
  simpleBookingSchema,
  SimpleBookingsResponseDTO,
} from '../../../domain/dtos/booking-simple.dto';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';

export const getSimpleBookingsInfo = async (
  req: Request
): Promise<SimpleBookingsResponseDTO[]> => {
  const authenticatedUserId = req.headers['x-user-id'] as string | undefined;

  if (!authenticatedUserId) {
    throw new InternalServerErrorException(
      'Internal Server Error. Missing required authentication headers'
    );
  }

  const now = new Date();
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const skip = (page - 1) * limit;
  const includePast = req.query.includePast === 'true';
  const sportsVenueNameFilter = req.query.sportsVenueName?.toString();
  const statusFilter = req.query.status?.toString();

  try {
    const ownerBookings =
      await bookingRepository.findByOwnerIdAndStartDateAfter(
        authenticatedUserId,
        now,
        includePast
      );

    const acceptedInvites =
      await bookingInviteRepository.findAcceptedFutureByUserId(
        authenticatedUserId,
        now,
        includePast
      );

    const inviteBookingIds = acceptedInvites.map((invite) => invite.bookingId);
    const invitedBookings = await bookingRepository.findManyByIds(
      inviteBookingIds,
      now,
      includePast
    );

    const allBookingsMap = new Map<string, (typeof ownerBookings)[0]>();
    [...ownerBookings, ...invitedBookings].forEach((booking) => {
      allBookingsMap.set(booking.getId(), booking);
    });

    const sortedBookings = Array.from(allBookingsMap.values()).sort(
      (a, b) =>
        new Date(a.bookingStartDate).getTime() -
        new Date(b.bookingStartDate).getTime()
    );

    const bookingsWithVenueInfo = await Promise.all(
      sortedBookings.map(async (booking) => {
        const sportsVenue = await sportsVenueRepository.findById(
          booking.sportsVenueId
        );
        return {
          booking,
          sportsVenue,
        };
      })
    );

    let filteredBookingsWithVenue = bookingsWithVenueInfo;
    if (statusFilter) {
      filteredBookingsWithVenue = filteredBookingsWithVenue.filter(
        (item) =>
          item.booking.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (sportsVenueNameFilter) {
      filteredBookingsWithVenue = filteredBookingsWithVenue.filter((item) =>
        item.sportsVenue?.sportsVenueName
          .toLowerCase()
          .includes(sportsVenueNameFilter.toLowerCase())
      );
    }

    const paginatedBookingsWithVenue = filteredBookingsWithVenue.slice(
      skip,
      skip + limit
    );

    const result: SimpleBookingsResponseDTO[] = [];

    for (const item of paginatedBookingsWithVenue) {
      if (item.sportsVenue) {
        const dto: SimpleBookingsResponseDTO = {
          bookingId: item.booking.getId(),
          bookingType: item.booking.bookingType,
          bookingStartDate: item.booking.bookingStartDate,
          bookingEndDate: item.booking.bookingEndDate,
          bookingPrice: item.booking.bookingPrice,
          sportsVenueId: item.booking.sportsVenueId,
          sportsVenueName: item.sportsVenue.sportsVenueName,
          bookingStatus: item.booking.status,
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
