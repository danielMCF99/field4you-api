import { Booking } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../domain/interfaces/BookingRepository";
import { jwtHelper } from "../../app";

export const createBooking = async (
  token: string,
  booking: Booking,
  repository: IBookingRepository
) => {
  try {
    const ownerId = await jwtHelper.verifyToken(token);
    if (!ownerId) {
      return undefined;
    }
    booking.ownerId = ownerId;
    const newBooking = await repository.create(booking);
    return newBooking;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
