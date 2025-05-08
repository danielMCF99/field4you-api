// src/dtos/recentBookings.dto.ts
import { z } from 'zod';

export const dailyBookingsSchema = z.object({
  date: z.string(), // formato: YYYY-MM-DD
  count: z.number().nonnegative(),
});

export const recentBookingsResponseSchema = z.object({
  currentMonthBookings: z.number().nonnegative(),
  previousMonthBookings: z.number().nonnegative(),
  percentageDifference: z.number(), // Pode ser negativo
  dailyBookings: z.array(dailyBookingsSchema),
});

export type RecentBookingsResponseDTO = z.infer<
  typeof recentBookingsResponseSchema
>;
