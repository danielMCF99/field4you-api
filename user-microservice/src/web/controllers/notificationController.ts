import { Request, Response } from 'express';
import { getNotificationsByUserId } from '../../application/use-cases/notifications/getNotificationsByUserId';
import { updateNotificationStatus } from '../../application/use-cases/notifications/updateNotificationStatus';

export const getAllByUseIdController = async (req: Request, res: Response) => {
  try {
    const notifications = await getNotificationsByUserId(req);
    res.status(200).json(notifications);
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const updateNotificationStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const notification = await updateNotificationStatus(req);
    res.status(200).json(notification);
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};
