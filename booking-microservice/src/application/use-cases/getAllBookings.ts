import { Request } from "express";
import { Booking } from "../../domain/entities/Booking";
import { authMiddleware, bookingRepository, jwtHelper } from "../../app";
import { UnauthorizedException } from "../../domain/exceptions/UnauthorizedException";
import { InternalServerErrorException } from "../../domain/exceptions/InternalServerErrorException";

export const getAllBookings = async (req: Request): Promise<Booking[]> => {
  try {
    const token = await jwtHelper.extractBearerToken(req);
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
    const allBookings = await bookingRepository.findAll();
    return allBookings;
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      throw new Error("Error getting all bookings");
    } else {
      throw new InternalServerErrorException("Error getting all bookings");
    }
  }
};
