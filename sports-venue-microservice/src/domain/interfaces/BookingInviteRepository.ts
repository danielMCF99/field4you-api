import { BookingInviteFilterParams } from '../dtos/booking-invite-filter.dto';
import { BookingInvite } from '../entities/BookingInvite';

export interface IBookingInviteRepository {
  findAll(params?: BookingInviteFilterParams): Promise<BookingInvite[]>;

  insertMany(bookingInvites: BookingInvite[]): Promise<BookingInvite[]>;

  existsBySportsVenueIdAndUserId(
    sportsVenueId: string,
    userId: string
  ): Promise<Boolean>;

  deleteByUserIdAndBookingIdAndSportsVenueId(
    userId: string,
    bookingId: string,
    sportsVenueId: string
  ): Promise<BookingInvite | null>;
}
