import { Document, Schema, Types, model } from 'mongoose';

interface IBookingInviteDocument extends Document {
  _id: Types.ObjectId;
  bookingId: string;
  userId: string;
  sportsVenueId: string;
  bookingStartDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const bookingInviteSchema = new Schema<IBookingInviteDocument>(
  {
    bookingId: { type: String, required: true },
    userId: { type: String, required: true },
    sportsVenueId: { type: String, required: true },
    bookingStartDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

export const BookingInviteModel = model<IBookingInviteDocument>(
  'BookingInvite',
  bookingInviteSchema,
  'BookingInvites'
);
