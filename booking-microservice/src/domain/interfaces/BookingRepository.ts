import { BookingFilterParams } from "../dto/booking-filter.dto";
import { Booking } from "../entities/Booking";

export interface IBookingRepository {
  create(booking: Booking): Promise<Booking>;
  findById(id: string): Promise<Booking | undefined>;
  findAll(params?: BookingFilterParams): Promise<Booking[]>;
  delete(id: string): Promise<boolean>;
  update(
    id: string,
    updatedData: Partial<Booking>
  ): Promise<Booking | undefined>;
  findConflictingBookings(
    sportsVenueId: string,
    bookingStartDate: Date,
    bookingEndDate: Date,
    idToExclude?: string
  ): Promise<Booking[]>;
}
