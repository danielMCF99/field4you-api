import { Document, Schema, Types, model } from 'mongoose';

interface ILoginHistoryDocument extends Document {
  _id: Types.ObjectId;
  userId: string;
  loginDate: Date;
  loginDay: string;
}

const loginHistorySchema = new Schema<ILoginHistoryDocument>({
  userId: { type: String, required: true },
  loginDate: { type: Date, default: Date.now },
  loginDay: { type: String, required: true },
});

loginHistorySchema.index({ userId: 1, loginDay: 1 }, { unique: true });

export const LoginHistoryModel = model<ILoginHistoryDocument>(
  'LoginHistory',
  loginHistorySchema,
  'LoginHistory'
);
