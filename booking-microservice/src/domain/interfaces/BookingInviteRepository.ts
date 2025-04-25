import mongoose, { ClientSession } from 'mongoose';
import { BookingInviteFilterParams } from '../dtos/booking-invite-filter.dto';
import { BookingInvite, BookingInviteStatus } from '../entities/BookingInvite';

export interface IBookingInviteRepository {
  create(bookingInvite: BookingInvite): Promise<BookingInvite>;

  findAll(params?: BookingInviteFilterParams): Promise<BookingInvite[]>;

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

  updateStatus(
    id: string,
    status: string,
    comments?: string
  ): Promise<BookingInvite | undefined>;

  bulkUpdateStatusByBookingIds(
    bookingIds: string[],
    status: BookingInviteStatus,
    reason: string,
    session?: ClientSession
  ): Promise<{ modifiedCount: number }>;

  bulkUpdateStatusByUserId(
    userId: string,
    status: BookingInviteStatus,
    reason: string,
    session?: ClientSession
  ): Promise<{ modifiedCount: number }>;

  bulkUpdateStatusByIds(
    bookingInvitesIds: string[],
    status: BookingInviteStatus,
    reason: string,
    session?: ClientSession
  ): Promise<{ modifiedCount: number }>;
}
