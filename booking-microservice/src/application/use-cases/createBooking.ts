import { Booking } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../domain/interfaces/BookingRepository";
import { authMiddleware } from "../../app";

export const createBooking = async (
  token: string,
  booking: Booking,
  repository: IBookingRepository
) => {
  try {
    const ownerId = await authMiddleware.verifyToken(token);
    if (!ownerId) {
      console.log("Invalid token");
      return undefined;
    }

    const bookingStartDate = new Date(booking.bookingStartDate);
    const bookingEndDate = new Date(booking.bookingEndDate);
    const now = new Date();

    if (bookingStartDate < now) {
      return undefined;
    }

    if (bookingEndDate <= bookingStartDate) {
      return undefined;
    }
    booking.ownerId = ownerId;
    const newBooking = await repository.create(booking);
    return newBooking;
  } catch (error) {
    console.log("Error creating booking");
    console.log(error);
    return undefined;
  }
};
