import { BookingStatus } from '../entities/Booking';

export interface BookingFilterParams {
  title?: string;
  status?: BookingStatus;
  bookingType?: string;
  bookingStartDate?: Date;
  bookingEndDate?: Date;
  sportsVenueId?: string | string[];
  page?: number;
  limit?: number;
}
