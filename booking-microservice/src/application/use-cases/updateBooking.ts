import { IBookingRepository } from "../../domain/interfaces/BookingRepository";
import { Booking } from "../../domain/entities/Booking";
import { authMiddleware } from "../../app";

export const updateBooking = async (
  id: string,
  token: string,
  updatedData: Partial<Booking>,
  repository: IBookingRepository
): Promise<{ status: number; message: string; booking?: Booking }> => {
  try {
    const booking = await repository.findById(id);
    if (!booking) {
      return { status: 404, message: "Booking not found" };
    }
    if (!booking.ownerId) {
      return {
        status: 404,
        message: "Booking not found",
      };
    }
    const authenticated = await authMiddleware.authenticate(
      booking.ownerId,
      token
    );

    if (!authenticated) {
      return {
        status: 401,
        message: "Authentication failed",
      };
    }
    const updatedBooking = await repository.update(booking.getId(), {
      ...updatedData,
    });
    console.log("Updated booking info");

    return {
      status: 200,
      message: "Booking update successfull",
      booking: updatedBooking,
    };
  } catch (error) {
    return {
      status: 500,
      message: "Something went wrong with booking update",
    };
  }
};
