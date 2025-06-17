import { z } from 'zod';
import { BookingType } from '../entities/Booking';

export const simpleBookingSchema = z.object({
  bookingId: z.string(),
  bookingType: z.nativeEnum(BookingType),
  bookingStartDate: z.date(),
  bookingEndDate: z.date(),
  bookingPrice: z.number().nonnegative(),
  sportsVenueId: z.string(),
  sportsVenueName: z.string(),
  bookingStatus: z.string(),
});

export type SimpleBookingsResponseDTO = z.infer<typeof simpleBookingSchema>;
