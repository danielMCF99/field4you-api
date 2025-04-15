import { Document, Schema, Types, model } from 'mongoose';

interface IBookingInviteDocument extends Document {
  _id: Types.ObjectId;
  bookingId: string;
  userId: string;
  status: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const bookingInviteSchema = new Schema<IBookingInviteDocument>(
  {
    bookingId: { type: String, required: true },
    userId: { type: String, required: true },
    status: {
      type: String,
      default: 'pending',
      enum: ['accepted', 'rejected', 'pending'],
    },
  },
  {
    timestamps: true,
  }
);

export const BookingInviteModel = model<IBookingInviteDocument>(
  'BookingInvite',
  bookingInviteSchema
);
