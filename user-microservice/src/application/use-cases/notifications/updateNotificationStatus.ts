import { Request } from 'express';
import mongoose from 'mongoose';
import { notificationRepository } from '../../../app';
import {
  Notification,
  NotificationStatus,
} from '../../../domain/entities/Notification';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { UserType } from '../../../domain/entities/User';

export const updateNotificationStatus = async (
  req: Request
): Promise<Notification> => {
  const authenticatedUserId = req.headers['x-user-id'] as string | undefined;
  const authenticatedUserType = req.headers['x-user-type'] as
    | string
    | undefined;

  if (!authenticatedUserId || !authenticatedUserType) {
    throw new InternalServerErrorException(
      'Internal Server Error. Missing required authentication headers'
    );
  }

  const id = req.params.id.toString();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }

  try {
    const notification = await notificationRepository.getById(id);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (authenticatedUserType != UserType.admin) {
      if (notification.userId != authenticatedUserId) {
        throw new ForbiddenException(
          'User is not allowed to update notification status'
        );
      }
    }

    console.log('Performing notification status update');
    const updatedNotification = notificationRepository.updateStatus(
      id,
      NotificationStatus.read
    );

    return updatedNotification;
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException('Error updating notification');
  }
};
