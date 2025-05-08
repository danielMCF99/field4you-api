import { z } from 'zod';

export const dailyActiveUsersSchema = z.object({
  date: z.string(),
  count: z.number().nonnegative(),
});

export const activeUsersResponseSchema = z.object({
  currentMonthActiveUsers: z.number().nonnegative(),
  previousMonthActiveUsers: z.number().nonnegative(),
  percentageDifference: z.number(),
  dailyActiveUsers: z.array(dailyActiveUsersSchema),
});

export type ActiveUsersResponseDTO = z.infer<typeof activeUsersResponseSchema>;
