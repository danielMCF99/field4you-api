import mongoose, { ClientSession } from 'mongoose';
import { BookingFilterParams } from '../dtos/booking-filter.dto';
import { Booking } from '../entities/Booking';

export interface IBookingRepository {
  create(booking: Booking, session: mongoose.ClientSession): Promise<Booking>;

  findById(id: string): Promise<Booking | undefined>;

  findAll(params?: BookingFilterParams): Promise<Booking[]>;

  delete(id: string): Promise<boolean>;

  update(
    id: string,
    updatedData: Partial<Booking>,
    session?: mongoose.ClientSession
  ): Promise<Booking | undefined>;

  findConflictingBookings(
    sportsVenueId: string,
    bookingStartDate: Date,
    bookingEndDate: Date,
    idToExclude?: string
  ): Promise<Booking[]>;

  findAllActiveByVenueIds(venueIds: string[]): Promise<Booking[]>;

  bulkStatusUpdateByIds(
    bookingIds: string[],
    session?: ClientSession
  ): Promise<{ modifiedCount?: number }>;

  cancelByUserId(
    userId: string,
    session?: ClientSession
  ): Promise<{ modifiedCount: number }>;

  countBookings(): Promise<number>;

  countBookingsByMonthAndType(): Promise<
    { month: string; regular: number; event: number }[]
  >;
}
