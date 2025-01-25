import { Request } from "express";
import { Booking } from "../../domain/entities/Booking";
import { authMiddleware, bookingRepository, jwtHelper } from "../../app";
import { UnauthorizedException } from "../../domain/exceptions/UnauthorizedException";
import { BadRequestException } from "../../domain/exceptions/BadRequestException";
import { checkBookingConflicts } from "./checkBookingConflicts";
import config from "../../config/env";
import mongoose from "mongoose";
import axios from "axios";
import { ConflictException } from "../../domain/exceptions/ConflictException";
import { InternalServerErrorException } from "../../domain/exceptions/InternalServerErrorException";

export const createBooking = async (
  req: Request
): Promise<Booking | undefined> => {
  try {
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

    if (!req) {
      throw new BadRequestException("Request body is required");
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
      throw new BadRequestException("Missing required fields");
    }
    const token = await jwtHelper.extractBearerToken(req);
    if (!token) {
      throw new UnauthorizedException("Authentication token is required");
    }
    const ownerId = await authMiddleware.verifyToken(token);
    if (!ownerId) {
      throw new UnauthorizedException("Authentication token is required");
    }
    const hasConflicts = await checkBookingConflicts(
      bookingRepository,
      sportsVenueId,
      new Date(bookingStartDate),
      new Date(bookingEndDate),
      undefined
    );
    if (hasConflicts) {
      throw new ConflictException("Booking conflicts with existing bookings");
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
    const formatedStartDate = new Date(booking.bookingStartDate);
    const formatedEndDate = new Date(booking.bookingEndDate);
    const now = new Date();

    if (formatedStartDate < now) {
      throw new BadRequestException("Booking start date cannot be in the past");
    }

    if (formatedEndDate <= formatedStartDate) {
      throw new BadRequestException(
        "Booking end date must be after start date"
      );
    }
    const invalidIds = invitedUsersIds.filter(
      (id: string) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      throw new BadRequestException("Invalid user IDs");
    }

    const response = await axios.get(
      `${config.sportsVenueGatewayServiceUri}/${sportsVenueId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status !== 200) {
      throw new BadRequestException("Sports venue not found");
    }
    booking.ownerId = ownerId;

    const newBooking = await bookingRepository.create(booking);
    if (!newBooking) {
      throw new BadRequestException("Failed to create booking");
    }

    return newBooking;
  } catch (error: any) {
    if (error instanceof UnauthorizedException) {
      throw new UnauthorizedException(error.message);
    } else if (error instanceof BadRequestException) {
      throw new BadRequestException(error.message);
    } else if (error instanceof ConflictException) {
      throw new ConflictException(error.message);
    } else {
      throw new InternalServerErrorException("Internal Server Error");
    }
  }
};
