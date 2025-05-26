export interface INotificationRepository {
  create(notification: Notification): Promise<Notification>;
  getByUserId(userId: string): Promise<Notification[]>;
  updateStatus(
    id: string,
    updatedData: Partial<Notification>
  ): Promise<Notification>;
}
