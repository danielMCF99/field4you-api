import { Schema, model, Document, Types } from 'mongoose';

interface IUserDocument extends Document {
  _id: Types.ObjectId;
  userType: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  district: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  birthDate: string;
  registerDate: Date;
  lastAccessDate: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const userSchema = new Schema<IUserDocument>({
  userType: { type: String, required: true, enum: ['user', 'owner'] },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  },
  password: { type: String, required: true },
  firstName: { type: String, required: true, minlength: 3 },
  lastName: { type: String, required: true, minlength: 3 },
  district: { type: String },
  city: { type: String },
  address: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  birthDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  registerDate: { type: Date, required: true },
  lastAccessDate: { type: Date, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

export const UserModel = model<IUserDocument>('User', userSchema);
