import { Document, Schema, Types, model } from 'mongoose';
import { Status } from '../../../domain/entities/OwnerRequest';

interface IOwnerRequest extends Document {
  userId: Types.ObjectId;
  message?: string;
  status: string;
  response?: string;
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
      enum: [Status.pending, Status.approved, Status.rejected],
      default: Status.pending,
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
  'OwnerRequests',
  ownerRequestSchema,
  'OwnerRequests'
);
