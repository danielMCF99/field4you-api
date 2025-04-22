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
  },
  {
    timestamps: true,
  }
);

export const SportsVenueModel = model<ISportsVenue>(
  'SportsVenue',
  SportsVenueSchema
);
