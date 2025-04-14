import { Document, Schema, Types, model } from "mongoose";

interface IOwnerRequest extends Document {
  user: Types.ObjectId;
  message?: string;
  status: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
}

const accountUpgradeRequestSchema = new Schema<IOwnerRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    message: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

export const OwnerRequestModel = model<IOwnerRequest>(
  "AccountUpgradeRequest",
  accountUpgradeRequestSchema
);
