import { Document, Schema, Types, model } from 'mongoose';

interface IBookingInviteDocument extends Document {
  _id: Types.ObjectId;
  bookingId: string;
  userId: string;
  bookingStartDate: Date;
  bookingEndDate: Date;
  status: string;
  comments?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const bookingInviteSchema = new Schema<IBookingInviteDocument>(
  {
    bookingId: { type: String, required: true },
    userId: { type: String, required: true },
    bookingStartDate: { type: Date, required: true },
    bookingEndDate: { type: Date, required: true },
    status: {
      type: String,
      default: 'pending',
      enum: ['accepted', 'rejected', 'pending'],
    },
    comments: { type: String },
  },
  {
    timestamps: true,
  }
);

export const BookingInviteModel = model<IBookingInviteDocument>(
  'BookingInvite',
  bookingInviteSchema
);
