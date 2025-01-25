import { Request } from "express";
import { Booking } from "../../domain/entities/Booking";
import { authMiddleware, bookingRepository, jwtHelper } from "../../app";
import { checkBookingConflicts } from "./checkBookingConflicts";
import mongoose from "mongoose";
import { UnauthorizedException } from "../../domain/exceptions/UnauthorizedException";
import { BadRequestException } from "../../domain/exceptions/BadRequestException";
import { ConflictException } from "../../domain/exceptions/ConflictException";
import { InternalServerErrorException } from "../../domain/exceptions/InternalServerErrorException";

export const updateBooking = async (req: Request): Promise<Booking> => {
  try {
    const id = req.params.id.toString();
    const token = await jwtHelper.extractBearerToken(req);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid ID format");
    }

    if (!token) {
      throw new UnauthorizedException("Bearer token required");
    }
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new BadRequestException("Booking not found");
    }
    if (!booking.ownerId) {
      throw new BadRequestException("Owner ID not found");
    }
    const authenticated = await authMiddleware.authenticate(
      booking.ownerId,
      token
    );
    if (!authenticated) {
      throw new UnauthorizedException("Authentication failed");
    }

    const allowedFields = [
      "bookingType",
      "status",
      "title",
      "bookingStartDate",
      "bookingEndDate",
      "isPublic",
      "invitedUsersIds",
    ];
    const updatedData: Record<string, any> = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updatedData[key] = req.body[key];
      }
    });
    const isSportsVenueIdChanged =
      updatedData.sportsVenueId &&
      updatedData.sportsVenueId !== booking.sportsVenueId;
    const isStartDateChanged =
      updatedData.bookingStartDate &&
      new Date(updatedData.bookingStartDate).getTime() !==
        new Date(booking.bookingStartDate).getTime();
    const isEndDateChanged =
      updatedData.bookingEndDate &&
      new Date(updatedData.bookingEndDate).getTime() !==
        new Date(booking.bookingEndDate).getTime();

    if (isSportsVenueIdChanged || isStartDateChanged || isEndDateChanged) {
      const hasConflicts = await checkBookingConflicts(
        bookingRepository,
        updatedData.sportsVenueId || booking.sportsVenueId,
        new Date(updatedData.bookingStartDate || booking.bookingStartDate),
        new Date(updatedData.bookingEndDate || booking.bookingEndDate),
        id
      );

      if (hasConflicts) {
        throw new ConflictException("Booking conflicts found");
      }
    }
    const updatedBooking = await bookingRepository.update(booking.getId(), {
      ...updatedData,
    });
    console.log("Updated booking info");
    if (!updatedBooking) {
      throw new BadRequestException("Error updating booking");
    }
    return updatedBooking;
  } catch (error) {
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
