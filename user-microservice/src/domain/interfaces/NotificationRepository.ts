import { Notification, NotificationStatus } from '../entities/Notification';

export interface INotificationRepository {
  create(notification: {
    userId: string;
    ownerRequestId: string;
    status: NotificationStatus;
    content?: string;
    phoneNumber?: string;
    adminOnly: Boolean;
  }): Promise<Notification>;
  getById(id: string): Promise<Notification | undefined>;
  getByUserId(
    page: number,
    limit: number,
    userId?: string,
    adminOnly?: Boolean
  ): Promise<Notification[]>;
  updateStatus(
    id: string,
    newStatus: NotificationStatus
  ): Promise<Notification>;
}
