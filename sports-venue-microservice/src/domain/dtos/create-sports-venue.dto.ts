import { z } from 'zod';
import { SportsVenueType } from '../entities/SportsVenue';

const timeRangeSchema = z.object({
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:mm format'),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'End time must be in HH:mm format'),
});

const dailyScheduleSchema = z.array(timeRangeSchema).max(7);

const weeklyScheduleSchema = z.object({
  Monday: dailyScheduleSchema.optional(),
  Tuesday: dailyScheduleSchema.optional(),
  Wednesday: dailyScheduleSchema.optional(),
  Thursday: dailyScheduleSchema.optional(),
  Friday: dailyScheduleSchema.optional(),
  Saturday: dailyScheduleSchema.optional(),
  Sunday: dailyScheduleSchema.optional(),
});

export const createSportsVenueSchema = z.object({
  sportsVenueType: z.nativeEnum(SportsVenueType),
  sportsVenueName: z.string().min(1, 'Sports Venue name is required'),
  bookingMinDuration: z
    .number()
    .positive('Booking minimum duration must be a positive number'),
  bookingMinPrice: z
    .number()
    .nonnegative('Booking minimum price must be zero or a positive number'),
  sportsVenuePictures: z
    .array(
      z.object({
        fileName: z.string(),
        imageURL: z.string().url(),
      })
    )
    .optional(),
  hasParking: z.boolean(),
  hasShower: z.boolean(),
  hasBar: z.boolean(),
  district: z.string().min(1, 'District is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(1, 'Address is required'),
  weeklySchedule: weeklyScheduleSchema.optional(),
});

export type CreateSportsVenueDTO = z.infer<typeof createSportsVenueSchema>;
