import { Request } from "express";
import { authMiddleware, bookingRepository, jwtHelper } from "../../app";
import { BadRequestException } from "../../domain/exceptions/BadRequestException";
import { UnauthorizedException } from "../../domain/exceptions/UnauthorizedException";
import { InternalServerErrorException } from "../../domain/exceptions/InternalServerErrorException";
import mongoose from "mongoose";

export const deleteBooking = async (req: Request): Promise<Boolean> => {
  try {
    const id = req.params.id.toString();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid ID format");
    }
    const token = await jwtHelper.extractBearerToken(req);
    if (!token) {
      throw new UnauthorizedException("Bearer token required");
    }
    const booking = await bookingRepository.findById(id);

    if (!booking) {
      throw new BadRequestException("Booking not found");
    }

    const authenticated = await authMiddleware.authenticate(
      booking.getOwnerId(),
      token
    );

    if (!authenticated) {
      throw new UnauthorizedException("Authentication failed");
    }

    const isDeleted = await bookingRepository.delete(id);
    if (!isDeleted) {
      throw new BadRequestException("Error deleting booking");
    }

    return true;
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw new Error("Error deleting booking");
    } else if (error instanceof UnauthorizedException) {
      throw new Error("Error deleting booking");
    } else {
      throw new InternalServerErrorException("Error deleting booking");
    }
  }
};
