import { Schema, model, Document, Types } from 'mongoose';
import {
  SportsVenueStatus,
  SportsVenueType,
  WeeklySchedule,
} from '../../../domain/entities/SportsVenue';

const TimeSlotSchema = new Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const WeeklyScheduleSchema = new Schema(
  {
    Monday: { type: [TimeSlotSchema], default: [] },
    Tuesday: { type: [TimeSlotSchema], default: [] },
    Wednesday: { type: [TimeSlotSchema], default: [] },
    Thursday: { type: [TimeSlotSchema], default: [] },
    Friday: { type: [TimeSlotSchema], default: [] },
    Saturday: { type: [TimeSlotSchema], default: [] },
    Sunday: { type: [TimeSlotSchema], default: [] },
  },
  { _id: false }
);

interface ISportsVenue extends Document {
  _id: Types.ObjectId;
  ownerId: string;
  sportsVenueType: SportsVenueType;
  status: SportsVenueStatus;
  bookingMinDuration: number;
  bookingMinPrice: number;
  weeklySchedule?: WeeklySchedule;
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
    weeklySchedule: { type: WeeklyScheduleSchema, required: false },
  },
  {
    timestamps: true,
  }
);

export const SportsVenueModel = model<ISportsVenue>(
  'SportsVenue',
  SportsVenueSchema
);
