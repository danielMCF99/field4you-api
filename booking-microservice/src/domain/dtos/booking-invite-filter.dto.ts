import { BookingInviteStatus } from '../entities/BookingInvite';

export interface BookingInviteFilterParams {
  bookingId?: string;
  userId?: string;
  status?: BookingInviteStatus;
  page?: number;
  limit?: number;
}
