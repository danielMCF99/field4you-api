import { Request, Response } from 'express';
import { createBooking } from '../../application/use-cases/createBooking';
import { deleteBooking } from '../../application/use-cases/deleteBooking';
import { getAllBookings } from '../../application/use-cases/getAllBookings';
import { getBookingById } from '../../application/use-cases/getBookingById';
import { updateBooking } from '../../application/use-cases/updateBooking';
import { updateBookingStatus } from '../../application/use-cases/updateBookingStatus';
import { BookingFilterParams } from '../../domain/dto/booking-filter.dto';

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

export const getAllBookingsController = async (
  req: Request, 
  res: Response
) => {
  try {
    const { title, status, bookingType, bookingStartDate, bookingEndDate } = req.query;

    const filters: BookingFilterParams = {
      title: title?.toString(),
      status: status?.toString(),
      bookingType: bookingType?.toString(),
      bookingStartDate: bookingStartDate ? new Date(bookingStartDate.toString()) : undefined,
      bookingEndDate: bookingEndDate ? new Date(bookingEndDate.toString()) : undefined,
    };

    const allBookings = await getAllBookings(filters);
    res.status(200).json({ bookings: allBookings });
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
