import { Types } from 'mongoose';
import {
  Notification,
  NotificationStatus,
} from '../../domain/entities/Notification';
import { INotificationRepository } from '../../domain/interfaces/NotificationRepository';
import { NotificationModel } from '../database/models/notification.model';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';

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
    status: NotificationStatus;
    content: string;
  }): Promise<Notification> {
    const newNotification = await NotificationModel.create({
      userId: new Types.ObjectId(notification.userId),
      status: notification.status,
      content: notification.content,
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
    userId: string,
    page: number,
    limit: number
  ): Promise<Notification[]> {
    const query: any = {
      userId: userId,
    };

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
