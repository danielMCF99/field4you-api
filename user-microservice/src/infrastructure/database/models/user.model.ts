import { Document, Schema, Types, model } from 'mongoose';

interface IUserDocument extends Document {
  _id: Types.ObjectId;
  userType: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  location: {
    district: string;
    city: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  birthDate: string;
  registerDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    userType: { type: String, required: true, enum: ['user', 'owner'] },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    phoneNumber: { type: String, required: false, length: 9 },
    firstName: { type: String, required: true, minlength: 3 },
    lastName: { type: String, required: true, minlength: 3 },
    location: {
      address: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
      city: { type: String },
      district: { type: String },
    },
    birthDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    registerDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<IUserDocument>('User', userSchema);
