import { z } from 'zod';
import { BookingType, PaymentMethod } from '../entities/Booking';
import mongoose from 'mongoose';

const isValidObjectId = (val: string) => mongoose.Types.ObjectId.isValid(val);

export const createBookingSchema = z.object({
  sportsVenueId: z.string(),
  bookingType: z.nativeEnum(BookingType),
  title: z.string().min(3).max(100),
  bookingStartDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid booking start date format',
  }),
  bookingEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid booking end date format',
  }),
  isPublic: z.boolean(),
  invitedUsersIds: z.array(
    z.string().refine(isValidObjectId, {
      message: 'Each invitedUserId must be a valid MongoDB ObjectId',
    })
  ),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

export type CreateBookingDTO = z.infer<typeof createBookingSchema>;
