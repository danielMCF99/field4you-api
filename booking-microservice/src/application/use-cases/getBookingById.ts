import { Request } from "express";
import { Booking } from "../../domain/entities/Booking";
import { authMiddleware, bookingRepository, jwtHelper } from "../../app";
import mongoose from "mongoose";
import { BadRequestException } from "../../domain/exceptions/BadRequestException";
import { UnauthorizedException } from "../../domain/exceptions/UnauthorizedException";
import { InternalServerErrorException } from "../../domain/exceptions/InternalServerErrorException";

export const getBookingById = async (req: Request): Promise<Booking> => {
  try {
    const id = req.params.id.toString();
    const token = await jwtHelper.extractBearerToken(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid ID format");
    }
    if (!token) {
      throw new UnauthorizedException("Bearer token required");
    }

    const decodedPayload = await jwtHelper.decodeBearerToken(token);
    if (!decodedPayload) {
      throw new UnauthorizedException("Bearer token required");
    }

    const { exp } = decodedPayload;
    const tokenExpired = await authMiddleware.validateTokenExpirationDate(exp);

    if (tokenExpired) {
      throw new UnauthorizedException("Bearer token validation expired");
    }
    const booking = await bookingRepository.findById(id);

    if (!booking) {
      throw new BadRequestException("Booking not found");
    }
    return booking;
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw new BadRequestException("Booking not found");
    } else if (error instanceof UnauthorizedException) {
      throw new UnauthorizedException("Invalid token");
    } else {
      throw new InternalServerErrorException("Error fetching booking");
    }
  }
};
