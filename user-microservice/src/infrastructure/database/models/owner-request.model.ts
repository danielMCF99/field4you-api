import { Document, Schema, Types, model } from 'mongoose';

interface IOwnerRequest extends Document {
  userId: Types.ObjectId;
  message?: string;
  status: string;
  response?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
}

const ownerRequestSchema = new Schema<IOwnerRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    message: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    response: { type: String },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

export const OwnerRequestModel = model<IOwnerRequest>(
  'ownerrequest',
  ownerRequestSchema
);
