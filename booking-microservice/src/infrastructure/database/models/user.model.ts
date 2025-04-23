import { Schema, model, Document, Types } from 'mongoose';
import { UserStatus, UserType } from '../../../domain/entities/User';

interface IUserDocument extends Document {
  _id: Types.ObjectId;
  userType: UserType;
  status: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUserDocument>(
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
    status: {
      type: String,
      required: true,
      default: UserStatus.active,
      enum: [UserStatus.active, UserStatus.inactive],
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<IUserDocument>('User', userSchema);
