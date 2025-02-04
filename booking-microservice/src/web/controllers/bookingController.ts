import { Request, Response } from "express";
import mongoose from "mongoose";
import axios from "axios";
import config from "../../config/env";
import { Booking } from "../../domain/entities/Booking";
import { jwtHelper, bookingRepository } from "../../app";
import { createBooking } from "../../application/use-cases/createBooking";
import { checkBookingConflicts } from "../../application/use-cases/checkBookingConflicts";
import { updateBooking } from "../../application/use-cases/updateBooking";
import { getBookingById } from "../../application/use-cases/getBookingById";
import { getAllBookings } from "../../application/use-cases/getAllBookings";
import { deleteBooking } from "../../application/use-cases/deleteBooking";
import { authMiddleware } from "../../app";

export const createBookingController = async (req: Request, res: Response) => {
  try {
    const booking = await createBooking(req);

    res.status(201).json({ message: "Booking created successfully" });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const updateBookingController = async (req: Request, res: Response) => {
  try {
    const booking = await updateBooking(req);
    res.status(200).json({ booking: booking });
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
    const allBookings = await getAllBookings(req);

    return res.status(200).json({ bookings: allBookings });
  } catch (error: any) {
    return res.status(error.statusCode).json({ message: error.message });
  }
};

export const deleteBookingController = async (req: Request, res: Response) => {
  try {
    const status = await deleteBooking(req);
    res.status(200).json({
      deleted: status,
    });
    return;
  } catch (error: any) {
    return res.status(error.statusCode).json({ message: error.message });
  }
};
