import mongoose from 'mongoose';
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

  insertMany(
    bookingInvites: BookingInvite[],
    session?: mongoose.ClientSession
  ): Promise<BookingInvite[]>;

  existsByBookingIdAndUserId(
    bookingId: string,
    userId: string
  ): Promise<Boolean>;

  findById(id: string): Promise<BookingInvite | undefined>;

  updateStatus(id: string, status: string): Promise<BookingInvite | undefined>;
}
