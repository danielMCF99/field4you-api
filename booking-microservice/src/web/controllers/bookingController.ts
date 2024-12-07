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
      res.status(401).json({ message: "Bearer token required" });
      return;
    }
    if (
      !sportsVenueId ||
      !bookingType ||
      !status ||
      !title ||
      !bookingStartDate ||
      !bookingEndDate
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const hasConflicts = await checkBookingConflicts(
      bookingRepository,
      sportsVenueId,
      new Date(bookingStartDate),
      new Date(bookingEndDate),
      undefined
    );

    if (hasConflicts) {
      return res.status(400).json({ message: "Conflicting booking exists" });
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
        error: "Invalid invitedUserIds",
        invalidIds,
      });
    }
    try {
      const response = await axios.get(
        `${config.sportsVenueGatewayServiceUri}/${sportsVenueId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200) {
        return res.status(404).json({ message: "Sports venue not found" });
      }
    } catch (error: any) {
      return res.status(404).json({ message: "Sports venue not found" });
    }

    const newBooking = await createBooking(token, booking, bookingRepository);
    if (!newBooking) {
      return res.status(500).json({ error: "Error creating a booking" });
    }
    return res.status(201).json({ message: "Booking created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error creating a booking" });
  }
};

export const updateBookingController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id.toString();
    const token = await jwtHelper.extractBearerToken(req);
    const updatedData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    if (!token) {
      res.status(401).json({ message: "Bearer token required" });
      return;
    }
    const { status, message, booking } = await updateBooking(
      id,
      token,
      updatedData,
      bookingRepository
    );

    if (!booking) {
      res.status(status).json({ message: message });
      return;
    }

    res.status(status).json({ message: message, data: booking });
    return;
  } catch (error) {
    return res.status(500).json({ error: "Error updating booking" });
  }
};

export const getBookingByIdController = async (req: Request, res: Response) => {
  const id = req.params.id.toString();
  const token = await jwtHelper.extractBearerToken(req);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid ID format" });
    return;
  }
  try {
    if (!token) {
      res.status(401).json({ message: "Bearer token required" });
      return;
    }

    const decodedPayload = await jwtHelper.decodeBearerToken(token);
    if (!decodedPayload) {
      res.status(401).json({ message: "Bearer token required" });
      return;
    }

    const { exp } = decodedPayload;
    const tokenExpired = await authMiddleware.validateTokenExpirationDate(exp);

    if (tokenExpired) {
      res.status(401).json({ message: "Bearer token validation expired" });
      return;
    }
    const { found, booking } = await getBookingById(id, bookingRepository);

    if (!found) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json(booking);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching booking" });
  }
};

export const getAllBookingsController = async (req: Request, res: Response) => {
  try {
    const token = await jwtHelper.extractBearerToken(req);
    if (!token) {
      res.status(401).json({ message: "Bearer token required" });
      return;
    }
    const decodedPayload = await jwtHelper.decodeBearerToken(token);
    if (!decodedPayload) {
      res.status(401).json({ message: "Bearer token required" });
      return;
    }

    const { exp } = decodedPayload;
    const tokenExpired = await authMiddleware.validateTokenExpirationDate(exp);

    if (tokenExpired) {
      res.status(401).json({ message: "Bearer token validation expired" });
      return;
    }

    const allBookings = await getAllBookings(bookingRepository);

    return res.status(200).json({ bookings: allBookings });
  } catch (error) {
    return res.status(500).json({ error: "Error fetching bookings:" });
  }
};

export const deleteBookingController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id.toString();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }
    const token = await jwtHelper.extractBearerToken(req);
    if (!token) {
      res.status(401).json({ message: "Bearer token required" });
      return;
    }
    const { status, message } = await deleteBooking(
      id,
      token,
      bookingRepository
    );
    res.status(status).json({ message: message });
    return;
  } catch (error) {
    return res.status(500).json({ error: "Error deleting booking" });
  }
};
