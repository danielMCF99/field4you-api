import { z } from 'zod';
import { SportsVenueType } from '../entities/sports-venue';

export const createSportsVenueSchema = z.object({
  sportsVenueType: z.nativeEnum(SportsVenueType),
  sportsVenueName: z.string().min(1, 'sportsVenueName is required'),
  bookingMinDuration: z
    .number()
    .positive('Booking minimum duration must be a positive number'),
  bookingMinPrice: z
    .number()
    .nonnegative('Booking minimum price must be zero or a positive number'),
  sportsVenuePictures: z.array(z.object({
    fileName: z.string(),
    imageURL: z.string().url(),
  })
).optional(),
  hasParking: z.boolean(),
  hasShower: z.boolean(),
  hasBar: z.boolean(),
  district: z.string().min(1, 'district is required'),
  city: z.string().min(1, 'city is required'),
  address: z.string().min(1, 'address is required'),
});

export type CreateSportsVenueDTO = z.infer<typeof createSportsVenueSchema>;
