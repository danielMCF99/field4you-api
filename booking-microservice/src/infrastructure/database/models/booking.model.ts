import { Schema, model, Document, Types } from 'mongoose';

interface IBookingDocument extends Document {
  _id: Types.ObjectId;
  ownerId: string;
  sportsVenueId: string;
  bookingType: string;
  status: string;
  title: string;
  bookingStartDate: Date;
  bookingEndDate: Date;
  isPublic: boolean;
  invitedUsersIds: string[];
}

const bookingSchema = new Schema<IBookingDocument>({
  ownerId: { type: String, required: true },
  sportsVenueId: { type: String, required: true },
  bookingType: { type: String, required: true, enum: ['regular', 'event'] },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'cancelled', 'done'],
  },
  title: { type: String, minlength: 3, maxlength: 100, required: true },
  bookingStartDate: { type: Date, required: true },
  bookingEndDate: { type: Date, required: true },
  isPublic: { type: Boolean, default: false },
  invitedUsersIds: { type: [String], default: [] },
});

export const BookingModel = model<IBookingDocument>('Booking', bookingSchema);
