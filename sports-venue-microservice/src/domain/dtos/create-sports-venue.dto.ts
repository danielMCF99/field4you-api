import { z } from 'zod';
import { SportsVenueType } from '../entities/sports-venue';

const timeRangeSchema = z.object({
  start: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:mm format'),
  end: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:mm format'),
});

const dailyScheduleSchema = z.array(timeRangeSchema).max(7);

const weeklyScheduleSchema = z.object({
  monday: dailyScheduleSchema.optional(),
  tuesday: dailyScheduleSchema.optional(),
  wednesday: dailyScheduleSchema.optional(),
  thursday: dailyScheduleSchema.optional(),
  friday: dailyScheduleSchema.optional(),
  saturday: dailyScheduleSchema.optional(),
  sunday: dailyScheduleSchema.optional(),
});

export const createSportsVenueSchema = z.object({
  sportsVenueType: z.nativeEnum(SportsVenueType),
  sportsVenueName: z.string().min(1, 'sportsVenueName is required'),
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
  district: z.string().min(1, 'district is required'),
  city: z.string().min(1, 'city is required'),
  address: z.string().min(1, 'address is required'),
  weeklySchedule: weeklyScheduleSchema.optional(),
});

export type CreateSportsVenueDTO = z.infer<typeof createSportsVenueSchema>;
