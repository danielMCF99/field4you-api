import { Notification } from '../entities/Notification';

export interface INotificationRepository {
  create(notification: Notification): Promise<Notification>;
  getByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<Notification[]>;
  updateStatus(
    id: string,
    updatedData: Partial<Notification>
  ): Promise<Notification>;
}
