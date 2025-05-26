import { Document, Schema, Types } from 'mongoose';
import { NotificationStatus } from '../../../domain/entities/Notification';

interface INotificationDocument extends Document {
  _id: Types.ObjectId;
  userId: string;
  status: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: String, required: true },
    status: {
      type: String,
      required: true,
      default: NotificationStatus.read,
      enum: [NotificationStatus.read, NotificationStatus.unread],
    },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
