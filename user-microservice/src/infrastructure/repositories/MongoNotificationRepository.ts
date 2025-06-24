import { Types } from 'mongoose';
import {
  Notification,
  NotificationStatus,
} from '../../domain/entities/Notification';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { INotificationRepository } from '../../domain/interfaces/NotificationRepository';
import { NotificationModel } from '../database/models/notification.model';

export class MongoNotificationRepository implements INotificationRepository {
  private static instance: MongoNotificationRepository;
  private constructor() {}

  public static getInstance(): MongoNotificationRepository {
    if (!MongoNotificationRepository.instance) {
      MongoNotificationRepository.instance = new MongoNotificationRepository();
    }
    return MongoNotificationRepository.instance;
  }

  async create(notification: {
    userId: string;
    ownerRequestId: string;
    userEmail: string;
    status: NotificationStatus;
    isApprovedRequest?: Boolean;
    content?: string;
    phoneNumber?: string;
    adminOnly: Boolean;
  }): Promise<Notification> {
    const newNotification = await NotificationModel.create({
      userId: new Types.ObjectId(notification.userId),
      ownerRequestId: notification.ownerRequestId,
      isApprovedRequest: notification.isApprovedRequest,
      userEmail: notification.userEmail,
      status: notification.status,
      content: notification.content,
      phoneNumber: notification.phoneNumber,
      adminOnly: notification.adminOnly,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Notification.fromMongooseDocument(newNotification);
  }

  async getById(id: string): Promise<Notification | undefined> {
    const notification = await NotificationModel.findById(id);

    if (!notification) {
      return undefined;
    }

    return Notification.fromMongooseDocument(notification);
  }

  async getByUserId(
    page: number,
    limit: number,
    userId?: string,
    adminOnly?: Boolean
  ): Promise<Notification[]> {
    const query: any = {};

    if (userId) {
      query.userId = userId;
    }

    if (adminOnly) {
      query.adminOnly = adminOnly;
    }

    query.status = NotificationStatus.unread;

    const skip = (page - 1) * limit;

    const notifications = await NotificationModel.find(query)
      .sort({ ['createdAt']: 'desc' })
      .skip(skip)
      .limit(limit)
      .lean();

    return notifications.map(Notification.fromMongooseDocument);
  }

  async updateStatus(
    id: string,
    newStatus: NotificationStatus
  ): Promise<Notification> {
    const updatedNotification = await NotificationModel.findByIdAndUpdate(id, {
      status: newStatus,
    });

    if (!updatedNotification) {
      throw new InternalServerErrorException('Internal Error');
    }

    return Notification.fromMongooseDocument(updatedNotification);
  }
}
