import { Types } from 'mongoose';
import { Notification } from '../../domain/entities/Notification';
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

  async create(notification: Notification): Promise<Notification> {
    const newNotification = await NotificationModel.create({
      userId: new Types.ObjectId(notification.userId),
      status: notification.status,
      content: notification.content,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    });

    return Notification.fromMongooseDocument(newNotification);
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
    updatedData: Partial<Notification>
  ): Promise<Notification> {
    throw new Error('Method not implemented.');
  }
}
