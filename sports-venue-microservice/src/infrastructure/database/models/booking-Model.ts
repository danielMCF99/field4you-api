import { Document, model, Schema, Types } from 'mongoose';

interface IBooking extends Document {
  _id: Types.ObjectId;
  ownerId: string;
  sportsVenueId: string;
  invitedUserIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    ownerId: { type: String, required: true },
    sportsVenueId: { type: String, required: true },
    invitedUserIds: { type: [String], required: true },
  },
  {
    timestamps: true,
  }
);

export const BookingModel = model<IBooking>('Booking', BookingSchema);
