import { Document, Schema, Types, model } from 'mongoose';
import { UserStatus } from '../../../domain/entities/User';

interface IUserDocument extends Document {
  _id: Types.ObjectId;
  userType: string;
  email: string;
  password: string;
  status: string;
  registerDate: Date;
  lastAccessDate: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
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
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    password: { type: String, required: true },
    status: {
      type: String,
      required: true,
      default: UserStatus.active,
      enum: [UserStatus.active, UserStatus.inactive],
    },
    registerDate: { type: Date, required: true },
    lastAccessDate: { type: Date, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<IUserDocument>('User', userSchema);
