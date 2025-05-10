import { z } from 'zod';

export const dailySportsVenueProfitsSchema = z.object({
  date: z.string(),
  dailyProfit: z.number().nonnegative(),
});

export const sportsVenueProfitResponseSchema = z.object({
  currentMonthProfit: z.number().nonnegative(),
  previousMonthProfit: z.number().nonnegative(),
  percentageDifference: z.number(),
  dailyProfits: z.array(dailySportsVenueProfitsSchema),
});

export type SportsVenueProfitResponseDTO = z.infer<
  typeof sportsVenueProfitResponseSchema
>;
