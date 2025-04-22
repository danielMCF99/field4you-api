import { z } from 'zod';
import { BookingType } from '../entities/Booking';
import mongoose from 'mongoose';

const isValidObjectId = (val: string) => mongoose.Types.ObjectId.isValid(val);

export const updateBookingSchema = z
  .object({
    bookingType: z.nativeEnum(BookingType).optional(),
    title: z.string().min(3).max(100).optional(),
    bookingStartDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid birthDate format',
      })
      .optional(),
    bookingEndDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid birthDate format',
      })
      .optional(),
    isPublic: z.boolean().optional(),
    invitedUsersIds: z
      .array(
        z.string().refine(isValidObjectId, {
          message: 'Each invitedUserId must be a valid MongoDB ObjectId',
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (
        data.bookingStartDate &&
        data.bookingEndDate &&
        new Date(data.bookingEndDate) <= new Date(data.bookingStartDate)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Booking end date must be after booking start date',
      path: ['bookingEndDate'],
    }
  );

export type UpdateBookingDTO = z.infer<typeof updateBookingSchema>;
