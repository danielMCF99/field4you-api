import { Schema, model, Document, Types } from 'mongoose';

interface IUserDocument extends Document {
  _id: Types.ObjectId;
  userType: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  district: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
}

const userSchema = new Schema<IUserDocument>({
  userType: { type: String, required: true, enum: ['user', 'owner'] },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  },
  phoneNumber: { type: String, required: false, length: 9 },
  firstName: { type: String, required: true, minlength: 3 },
  lastName: { type: String, required: true, minlength: 3 },
  district: { type: String },
  city: { type: String },
  address: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
});

export const UserModel = model<IUserDocument>('User', userSchema);
