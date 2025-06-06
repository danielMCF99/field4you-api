import { Request, Response } from 'express';
import { createBooking } from '../../application/use-cases/booking/createBooking';
import { deleteBooking } from '../../application/use-cases/booking/deleteBooking';
import { getAllBookings } from '../../application/use-cases/booking/getAllBookings';
import { getBookingById } from '../../application/use-cases/booking/getBookingById';
import { getRecentBookings } from '../../application/use-cases/booking/getRecentBookings';
import { updateBooking } from '../../application/use-cases/booking/updateBooking';
import { updateBookingStatus } from '../../application/use-cases/booking/updateBookingStatus';
import { getWebGraphics } from '../../application/use-cases/graphics/web-graphics';
import { getSportsVenueProfit } from '../../application/use-cases/sportsVenue/getSportsVenueProfit';
import { getSimpleBookingsInfo } from '../../application/use-cases/booking/getSimpleBookingInfo';

export const createBookingController = async (req: Request, res: Response) => {
  try {
    const booking = await createBooking(req);

    res.status(201).json(booking);
    return;
  } catch (error: any) {
    if (error.details) {
      res
        .status(error.statusCode)
        .json({ message: error.message, details: error.details });
      return;
    }

    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const updateBookingController = async (req: Request, res: Response) => {
  try {
    const booking = await updateBooking(req);
    res.status(200).json(booking);
    return booking;
  } catch (error: any) {
    return res.status(error.statusCode).json({ message: error.message });
  }
};

export const updateBookingStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const booking = await updateBookingStatus(req);
    res.status(200).json(booking);
    return booking;
  } catch (error: any) {
    return res.status(error.statusCode).json({ message: error.message });
  }
};

export const getBookingByIdController = async (req: Request, res: Response) => {
  try {
    const booking = await getBookingById(req);

    return res.status(200).json(booking);
  } catch (error: any) {
    return res.status(error.statusCode).json({ message: error.message });
  }
};

export const getAllBookingsController = async (req: Request, res: Response) => {
  try {
    const allBookings = await getAllBookings(req.query);
    res.status(200).json({ bookings: allBookings });
    return;
  } catch (error: any) {
    return res.status(error.statusCode).json({ message: error.message });
  }
};

export const deleteBookingController = async (req: Request, res: Response) => {
  try {
    await deleteBooking(req);
    res.status(204).json({});
    return;
  } catch (error: any) {
    return res.status(error.statusCode).json({ message: error.message });
  }
};

export const getRecentBookingsController = async (
  req: Request,
  res: Response
) => {
  try {
    const response = await getRecentBookings(req);
    res.status(200).json(response);
    return;
  } catch (error: any) {
    return res.status(error.statusCode).json({ message: error.message });
  }
};

export const getRecentBookingsProfitController = async (
  req: Request,
  res: Response
) => {
  try {
    const response = await getSportsVenueProfit(req);
    res.status(200).json(response);
    return;
  } catch (error: any) {
    return res.status(error.statusCode).json({ message: error.message });
  }
};

export const getWebGraphicsController = async (req: Request, res: Response) => {
  try {
    const response = await getWebGraphics(req);
    res.status(200).json(response);
    return;
  } catch (error: any) {
    return res.status(error.statusCode).json({ message: error.message });
  }
};

export const getSimpleBookingsController = async (
  req: Request,
  res: Response
) => {
  try {
    const allBookings = await getSimpleBookingsInfo(req, req.query);
    res.status(200).json({ bookings: allBookings });
    return;
  } catch (error: any) {
    return res.status(error.statusCode).json({ message: error.message });
  }
};
