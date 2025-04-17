import { Request, Response } from 'express';
import { getAllBookingInvites } from '../../application/use-cases/bookingInvite/getAllBookingInvites';

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
