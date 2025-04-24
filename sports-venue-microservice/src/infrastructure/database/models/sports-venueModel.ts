import { Document, Schema, Types, model } from 'mongoose';
import {
  SportsVenueStatus,
  SportsVenueType,
} from '../../../domain/entities/sports-venue';

interface ISportsVenue extends Document {
  _id: Types.ObjectId;
  ownerId: string;
  sportsVenueType: SportsVenueType;
  status: SportsVenueStatus;
  sportsVenueName: string;
  bookingMinDuration: number;
  bookingMinPrice: number;
  sportsVenuePictures: [{
    fileName: string,
    imageURL: string,
  }];
  hasParking: boolean;
  hasShower: boolean;
  hasBar: boolean;
  location: {
    district: string;
    city: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const SportsVenueSchema = new Schema<ISportsVenue>(
  {
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
    sportsVenueName: { type: String, required: true },
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
    sportsVenuePictures: [{
      fileName: { type: String },
      imageURL: { type: String },
    }],
    hasParking: { type: Boolean, required: true },
    hasShower: { type: Boolean, required: true },
    hasBar: { type: Boolean, required: true },
    location: {
      address: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
      city: { type: String },
      district: { type: String },
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
