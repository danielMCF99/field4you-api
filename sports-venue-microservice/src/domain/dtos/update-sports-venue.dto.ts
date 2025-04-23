import { z } from 'zod';
import { SportsVenueType } from '../entities/sports-venue';

export const updateSportsVenueSchema = z
  .object({
    sportsVenueType: z.nativeEnum(SportsVenueType),
    sportsVenueName: z.string().min(1, 'Sports Venue name is required'),
    bookingMinDuration: z
      .number()
      .positive('Booking minimum duration must be a positive number'),
    bookingMinPrice: z
      .number()
      .nonnegative('Booking minimum price must be zero or a positive number'),
    sportsVenuePicture: z.string(),
    hasParking: z.boolean(),
    hasShower: z.boolean(),
    hasBar: z.boolean(),
    district: z.string().min(1, 'District is required'),
    city: z.string().min(1, 'City is required'),
    address: z.string().min(1, 'Address is required'),
    rating: z.number().min(1).max(5),
  })
  .partial();

export type UpdateSportsVenueDTO = z.infer<typeof updateSportsVenueSchema>;
