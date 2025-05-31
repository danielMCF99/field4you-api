import { Notification, NotificationStatus } from '../entities/Notification';

export interface INotificationRepository {
  create(notification: {
    userId: string;
    status: NotificationStatus;
    content: string;
  }): Promise<Notification>;
  getById(id: string): Promise<Notification | undefined>;
  getByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<Notification[]>;
  updateStatus(
    id: string,
    newStatus: NotificationStatus
  ): Promise<Notification>;
}
