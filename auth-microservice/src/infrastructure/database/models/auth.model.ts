import { Document, Schema, Types, model } from 'mongoose';
import { UserStatus, UserType } from '../../../domain/entities/Auth';

interface IAuthDocument extends Document {
  _id: Types.ObjectId;
  userType: string;
  email: string;
  password: string;
  status: string;
  registerDate: Date;
  lastAccessDate: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  pushNotificationToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const authSchema = new Schema<IAuthDocument>(
  {
    userType: {
      type: String,
      required: true,
      enum: [UserType.user, UserType.owner],
    },
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
    pushNotificationToken: { type: String },
  },
  {
    timestamps: true,
  }
);

export const AuthModel = model<IAuthDocument>('Auth', authSchema, 'Auth');
