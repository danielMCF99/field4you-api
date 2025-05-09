import { Document, Schema, Types, model } from 'mongoose';

interface ILoginHistoryDocument extends Document {
  _id: Types.ObjectId;
  userId: string;
  loginDate: Date;
}

const loginHistorySchema = new Schema<ILoginHistoryDocument>({
  userId: { type: String, required: true },
  loginDate: { type: Date, default: Date.now },
});

export const LoginHistoryModel = model<ILoginHistoryDocument>(
  'LoginHistory',
  loginHistorySchema,
  'LoginHistory'
);
