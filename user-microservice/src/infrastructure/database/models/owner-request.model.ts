import { Document, Schema, Types, model } from 'mongoose';
import { Status } from '../../../domain/entities/OwnerRequest';

interface IOwnerRequest extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  message?: string;
  status: string;
  response?: string;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
  requestNumber: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ownerRequestSchema = new Schema<IOwnerRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: { type: String },
    status: {
      type: String,
      enum: [Status.pending, Status.approved, Status.rejected],
      default: Status.pending,
    },
    response: { type: String },
    reviewedAt: { type: Date },
    reviewedBy: { type: String, match: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/ },
    requestNumber: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

ownerRequestSchema.pre('validate', async function (next) {
  if (this.isNew) {
    // Tenta gerar um número único de 10 dígitos
    let generated;
    let exists = true;
    do {
      generated = Math.floor(
        1000000000 + Math.random() * 9000000000
      ).toString();
      exists = !!(await OwnerRequestModel.exists({ requestNumber: generated }));
    } while (exists);

    this.requestNumber = generated;
  }
  next();
});

export const OwnerRequestModel = model<IOwnerRequest>(
  'OwnerRequests',
  ownerRequestSchema,
  'OwnerRequests'
);
