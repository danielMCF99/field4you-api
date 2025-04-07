import { Schema, model, Document, Types } from "mongoose";

interface ISportsVenue extends Document {
  _id: Types.ObjectId;
  ownerId: string;
  location: string;
  sportsVenueType: string;
  status: string;
  sportsVenueName: string;
  bookingMinDuration: number;
  bookingMinPrice: number;
  sportsVenuePicture: string;
  hasParking: boolean;
  hasShower: boolean;
  hasBar: boolean;
}

const SportsVenueSchema = new Schema<ISportsVenue>({
  _id: { type: Schema.ObjectId, required: true },
  ownerId: { type: String, required: true },
  location: { type: String, required: true },
  sportsVenueType: {
    type: String,
    required: true,
    enum: ["5x5", "7x7", "9x9", "11x11"],
  },
  status: { type: String, required: true, enum: ["active", "inactive"] },
  sportsVenueName: { type: String, required: true },
  bookingMinDuration: { type: Number, required: true },
  bookingMinPrice: { type: Number, required: true },
  sportsVenuePicture: { type: String, required: true },
  hasParking: { type: Boolean, required: true },
  hasShower: { type: Boolean, required: true },
  hasBar: { type: Boolean, required: true },
});

export const SportsVenueModel = model<ISportsVenue>(
  "SportsVenue",
  SportsVenueSchema
);
