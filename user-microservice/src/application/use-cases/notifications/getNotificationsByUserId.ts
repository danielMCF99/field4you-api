import { Request } from 'express';
import { notificationRepository } from '../../../app';
import { Notification } from '../../../domain/entities/Notification';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { UserType } from '../../../domain/entities/User';

export const getNotificationsByUserId = async (
  req: Request
): Promise<{
  notifications: Notification[];
}> => {
  try {
    const authenticatedUserId = req.headers['x-user-id'] as string | undefined;
    const authenticatedUserType = req.headers['x-user-type'] as
      | string
      | undefined;

    if (!authenticatedUserId || !authenticatedUserType) {
      throw new InternalServerErrorException(
        'Internal Server Error. Missing required authentication headers'
      );
    }

    const limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
    const page = req.query.page ? parseInt(req.query.page.toString()) : 1;

    let notifications;
    if (authenticatedUserType === UserType.admin) {
      notifications = await notificationRepository.getByUserId(
        page,
        limit,
        undefined,
        true
      );
    } else {
      notifications = await notificationRepository.getByUserId(
        page,
        limit,
        authenticatedUserId,
        undefined
      );
    }

    return { notifications: notifications };
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException('Error getting user notifications');
  }
};
