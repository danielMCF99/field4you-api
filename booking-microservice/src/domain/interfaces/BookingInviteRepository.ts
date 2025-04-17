import { BookingInviteFilterParams } from '../dto/booking-invite-filter.dto';
import { BookingInvite } from '../entities/BookingInvite';

export interface IBookingInviteRepository {
  create(bookingInvite: BookingInvite): Promise<BookingInvite>;
  findAll(params?: BookingInviteFilterParams): Promise<BookingInvite[]>;
  findAllByBookingId(bookingId: string): Promise<BookingInvite[] | []>;
  findAllByUserId(userId: string): Promise<BookingInvite[] | []>;
  update(
    bookingId: string,
    userId: string,
    updatedData: Partial<BookingInvite>
  ): Promise<BookingInvite | undefined>;
}
