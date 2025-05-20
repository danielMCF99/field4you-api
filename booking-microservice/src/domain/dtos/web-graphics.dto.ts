import { z } from 'zod';

export const webGraphicsResponseSchema = z.object({
  totalPlayers: z.number().nonnegative(),
  totalManagers: z.number().nonnegative(),
  totalBookings: z.number().nonnegative(),
  totalSportsVenues: z.number().nonnegative(),
});

export type WebGraphicsResponseDTO = z.infer<typeof webGraphicsResponseSchema>;
