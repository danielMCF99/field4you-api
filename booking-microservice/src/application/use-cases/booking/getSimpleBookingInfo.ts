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

  try {
    // 1. Buscar reservas do utilizador
    const ownerBookings =
      await bookingRepository.findByOwnerIdAndStartDateAfter(
        authenticatedUserId,
        now,
        includePast
      );

    // 2. Buscar convites aceites
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

    // 3. Combinar e remover duplicados
    const allBookingsMap = new Map<string, (typeof ownerBookings)[0]>();
    [...ownerBookings, ...invitedBookings].forEach((booking) => {
      allBookingsMap.set(booking.getId(), booking);
    });

    // 4. Converter para array e ordenar
    const sortedBookings = Array.from(allBookingsMap.values()).sort(
      (a, b) =>
        new Date(a.bookingStartDate).getTime() -
        new Date(b.bookingStartDate).getTime()
    );

    // 5. Aplicar paginação
    const paginatedBookings = sortedBookings.slice(skip, skip + limit);

    // 6. Gerar resposta DTO
    const result: SimpleBookingsResponseDTO[] = [];

    for (const booking of paginatedBookings) {
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
