import { notificationRepository } from '../../../app';
import {
  Notification,
  NotificationStatus,
} from '../../../domain/entities/Notification';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';

export const createNotification = async (notification: {
  userId: string;
  content: string;
}): Promise<Notification> => {
  try {
    const newNotification = await notificationRepository.create({
      ...notification,
      status: NotificationStatus.unread,
    });

    return newNotification;
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException('Error creating notification');
  }
};
