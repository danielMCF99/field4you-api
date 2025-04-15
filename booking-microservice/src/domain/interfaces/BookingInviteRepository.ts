import { BookingInvite } from '../entities/BookingInvite';

export interface IBookingInviteRepository {
  create(bookingInvite: BookingInvite): Promise<BookingInvite>;
  findAllByBookingId(bookingId: string): Promise<BookingInvite[] | []>;
  findAllByUserId(userId: string): Promise<BookingInvite[] | []>;
  update(
    bookingId: string,
    userId: string,
    updatedData: Partial<BookingInvite>
  ): Promise<BookingInvite | undefined>;
}
