import { z } from 'zod';

export const simpleBookingSchema = z.object({
  bookingId: z.string(),
  bookingStartDate: z.date(),
  bookingEndDate: z.date(),
  bookingPrice: z.number().nonnegative(),
  sportsVenueId: z.string(),
  sportsVenueName: z.string(),
  bookingStatus: z.string(),
});

export type SimpleBookingsResponseDTO = z.infer<typeof simpleBookingSchema>;
