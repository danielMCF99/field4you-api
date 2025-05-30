import { Request } from 'express';
import { notificationRepository } from '../../../app';
import { Notification } from '../../../domain/entities/Notification';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';

export const getNotificationsByUserId = async (
  req: Request
): Promise<{
  notifications: Notification[];
}> => {
  try {
    const authenticatedUserId = req.headers['x-user-id'] as string | undefined;
    if (!authenticatedUserId) {
      throw new InternalServerErrorException(
        'Internal Server Error. Missing required authentication headers'
      );
    }

    const limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
    const page = req.query.page ? parseInt(req.query.page.toString()) : 1;

    const notifications = await notificationRepository.getByUserId(
      authenticatedUserId,
      page,
      limit
    );

    return { notifications: notifications };
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException('Error getting user notifications');
  }
};
