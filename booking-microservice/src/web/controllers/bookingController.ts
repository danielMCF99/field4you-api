import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Booking } from '../../domain/entities/Booking';
import { jwtHelper, bookingRepository } from '../../app';
import { createBooking } from '../../application/use-cases/createBooking';
import { updateBooking } from '../../application/use-cases/updateBooking';
import { getBookingById } from '../../application/use-cases/getBookingById';
import { getAllBookings } from '../../application/use-cases/getAllBookings';
import { deleteBooking } from '../../application/use-cases/deleteBooking';

export const createBookingController = async (req: Request, res: Response) => {
  try {
    const token = await jwtHelper.extractBearerToken(req);
    const {
      sportsVenueId,
      bookingType,
      status,
      title,
      bookingStartDate,
      bookingEndDate,
      isPublic,
      invitedUsersIds,
    } = req.body;
    if (!token) {
      res.status(401).json({ message: 'Bearer token required' });
      return;
    }
    if (
      !sportsVenueId ||
      !bookingType ||
      !status ||
      !title ||
      !bookingStartDate ||
      !bookingEndDate ||
      !isPublic
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const booking = new Booking({
      sportsVenueId,
      bookingType,
      status,
      title,
      bookingStartDate,
      bookingEndDate,
      isPublic,
      invitedUsersIds,
    });
    const invalidIds = invitedUsersIds.filter(
      (id: string) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      return res.status(400).json({
        error: 'Invalid invitedUserIds',
        invalidIds,
      });
    }
    const newBooking = await createBooking(token, booking, bookingRepository);
    if (!newBooking) {
      return res.status(500).json({ error: 'Error creating a booking' });
    }
    return res.status(201).json({ message: 'Booking created successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Error creating a booking+' });
  }
};

export const updateBookingController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id.toString();
    const token = await jwtHelper.extractBearerToken(req);
    const updatedData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }

    if (!token) {
      res.status(401).json({ message: 'Bearer token required' });
      return;
    }

    const updatedBooking = await updateBooking(
      id,
      token,
      updatedData,
      bookingRepository
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.status(200).json({
      message: 'Booking updated successfully',
      data: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error updating booking' });
  }
};

export const getBookingByIdController = async (req: Request, res: Response) => {
  const id = req.params.id.toString();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid ID format' });
    return;
  }
  try {
    const { found, booking } = await getBookingById(id, bookingRepository);

    if (!found) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.status(200).json(booking);
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching booking' });
  }
};

export const getAllBookingsController = async (
  _req: Request,
  res: Response
) => {
  try {
    const allBookings = await getAllBookings(bookingRepository);

    return res.status(200).json({ bookings: allBookings });
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching bookings:' });
  }
};

export const deleteBookingController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id.toString();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }
    const token = await jwtHelper.extractBearerToken(req);
    if (!token) {
      res.status(401).json({ message: 'Bearer token required' });
      return;
    }
    const deletedBooking = await deleteBooking(id, token, bookingRepository);
    if (!deletedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    return res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Error deleting booking' });
  }
};
