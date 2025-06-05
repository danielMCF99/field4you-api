import { Document, model, Schema, Types } from 'mongoose';
import { NotificationStatus } from '../../../domain/entities/Notification';

interface INotificationDocument extends Document {
  _id: Types.ObjectId;
  userId: string;
  ownerRequestId: string;
  userEmail: string;
  phoneNumber?: string;
  status: string;
  content?: string;
  adminOnly: Boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: String, required: true },
    ownerRequestId: { type: String, required: true },
    userEmail: { type: String, required: true },
    phoneNumber: { type: String, required: false },
    status: {
      type: String,
      required: true,
      default: NotificationStatus.read,
      enum: [NotificationStatus.read, NotificationStatus.unread],
    },
    content: { type: String, required: false },
    adminOnly: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  }
);

export const NotificationModel = model<INotificationDocument>(
  'Notifications',
  notificationSchema,
  'Notifications'
);
