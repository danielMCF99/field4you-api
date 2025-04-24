import { z } from 'zod';

export const updateSportsVenueRatingSchema = z
  .object({
    bookingId: z.string().nonempty(),
    rating: z.number().min(1).max(5),
  })
  .partial();

export type UpdateSportsVenueRatingDTO = z.infer<
  typeof updateSportsVenueRatingSchema
>;
