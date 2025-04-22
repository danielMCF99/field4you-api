import { Schema, model, Document, Types } from 'mongoose';
import { BookingStatus, BookingType } from '../../../domain/entities/Booking';

interface IBookingDocument extends Document {
  _id: Types.ObjectId;
  ownerId: string;
  sportsVenueId: string;
  bookingType: BookingType;
  status: BookingStatus;
  title: string;
  bookingStartDate: Date;
  bookingEndDate: Date;
  isPublic: boolean;
  invitedUsersIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const bookingSchema = new Schema<IBookingDocument>(
  {
    ownerId: { type: String, required: true },
    sportsVenueId: { type: String, required: true },
    bookingType: {
      type: String,
      required: true,
      enum: [BookingType.event, BookingType.regular],
    },
    status: {
      type: String,
      required: true,
      default: BookingStatus.active,
      enum: [BookingStatus.active, BookingStatus.cancelled, BookingStatus.done],
    },
    title: { type: String, minlength: 3, maxlength: 100, required: true },
    bookingStartDate: { type: Date, required: true },
    bookingEndDate: { type: Date, required: true },
    isPublic: { type: Boolean, default: false },
    invitedUsersIds: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

export const BookingModel = model<IBookingDocument>('Booking', bookingSchema);
