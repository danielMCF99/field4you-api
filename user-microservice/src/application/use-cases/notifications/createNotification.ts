import { notificationRepository } from '../../../app';
import {
  Notification,
  NotificationStatus,
} from '../../../domain/entities/Notification';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';

export const createNotification = async (notification: {
  userId: string;
  ownerRequestId: string;
  userEmail: string;
  isApprovedRequest?: Boolean;
  phoneNumber?: string;
  content?: string;
  adminOnly: Boolean;
}): Promise<Notification> => {
  try {
    const newNotification = await notificationRepository.create({
      userId: notification.userId,
      ownerRequestId: notification.ownerRequestId,
      isApprovedRequest: notification.isApprovedRequest,
      userEmail: notification.userEmail,
      phoneNumber: notification.phoneNumber,
      content: notification.content,
      adminOnly: notification.adminOnly,
      status: NotificationStatus.unread,
    });

    return newNotification;
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException('Error creating notification');
  }
};
