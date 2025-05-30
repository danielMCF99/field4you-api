import { z } from 'zod';

export const dailyTotalPlayersSchema = z.object({
  date: z.string(),
  count: z.number().nonnegative(),
});

export const totalPlayersResponseSchema = z.object({
  currentMonthTotalPlayers: z.number().nonnegative(),
  previousMonthTotalPlayers: z.number().nonnegative(),
  percentageDifference: z.number(),
  dailyTotalUsers: z.array(dailyTotalPlayersSchema),
});

export type TotalPlayersResponseDTO = z.infer<
  typeof totalPlayersResponseSchema
>;
