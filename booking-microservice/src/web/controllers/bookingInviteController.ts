import { Request, Response } from 'express';
import { getAllBookingInvites } from '../../application/use-cases/bookingInvite/getAllBookingInvites';
import { updateBookingInviteStatus } from '../../application/use-cases/bookingInvite/updateBookingInviteStatus';

export const getAllBookingInvitesController = async (
  req: Request,
  res: Response
) => {
  try {
    const allBookingInvites = await getAllBookingInvites(req.query);
    res.status(200).json({ bookingInvites: allBookingInvites });
    return;
  } catch (error: any) {
    return res.status(error.statusCode).json({ message: error.message });
  }
};

export const updateBookingInviteStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const bookingInvite = await updateBookingInviteStatus(req);
    res.status(200).json(bookingInvite);
    return bookingInvite;
  } catch (error: any) {
    return res.status(error.statusCode).json({ message: error.message });
  }
};
