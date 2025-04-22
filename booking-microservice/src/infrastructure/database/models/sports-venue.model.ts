import { Schema, model, Document, Types } from 'mongoose';
import {
  SportsVenueStatus,
  SportsVenueType,
} from '../../../domain/entities/SportsVenue';

interface ISportsVenue extends Document {
  _id: Types.ObjectId;
  ownerId: string;
  sportsVenueType: SportsVenueType;
  status: SportsVenueStatus;
  bookingMinDuration: number;
  bookingMinPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const SportsVenueSchema = new Schema<ISportsVenue>(
  {
    _id: { type: Schema.ObjectId, required: true },
    ownerId: { type: String, required: true },
    sportsVenueType: {
      type: String,
      required: true,
      enum: [
        SportsVenueType.five_vs_five,
        SportsVenueType.seven_vs_seven,
        SportsVenueType.nine_vs_nive,
        SportsVenueType.eleven_vs_eleven,
      ],
    },
    status: {
      type: String,
      required: true,
      enum: [SportsVenueStatus.active, SportsVenueStatus.inactive],
    },
    bookingMinDuration: {
      type: Number,
      required: true,
      validate: {
        validator: (value) => value > 0,
        message: 'Booking minimum duration must be greater than 0 minutes',
      },
    },
    bookingMinPrice: {
      type: Number,
      required: true,
      validate: {
        validator: (value) => value >= 0,
        message: 'Booking minimum price must be equal or greater than 0',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const SportsVenueModel = model<ISportsVenue>(
  'SportsVenue',
  SportsVenueSchema
);
