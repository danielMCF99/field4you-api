import { bookingInviteRepository } from '../../../app';
import { BookingInviteFilterParams } from '../../../domain/dtos/booking-invite-filter.dto';
import { BookingInvite } from '../../../domain/entities/BookingInvite';

export const getAllBookingInvites = async (
  queryParams: any
): Promise<BookingInvite[]> => {
  const { bookingId, userId, status, limit, page } = queryParams;

  const filters: BookingInviteFilterParams = {
    bookingId: bookingId?.toString(),
    userId: userId?.toString(),
    status: status?.toString(),
    limit: limit ? parseInt(limit) : 10,
    page: page ? parseInt(page) : 1,
  };

  return await bookingInviteRepository.findAll(filters);
};
