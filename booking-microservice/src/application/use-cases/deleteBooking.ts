import { IBookingRepository } from "../../domain/interfaces/BookingRepository";
import { authMiddleware } from "../../app";

export const deleteBooking = async (
  id: string,
  token: string,
  repository: IBookingRepository
): Promise<{ status: number; message: string; authServiceUserId?: string }> => {
  try {
    const booking = await repository.findById(id);

    if (!booking) {
      return {
        status: 404,
        message: "Booking with given ID not found",
      };
    }

    const authenticated = await authMiddleware.authenticate(
      booking.getOwnerId(),
      token
    );

    if (!authenticated) {
      return {
        status: 401,
        message: "Authentication failed",
      };
    }

    const isDeleted = await repository.delete(id);
    if (!isDeleted) {
      return {
        status: 500,
        message: "Error when deleting resource",
      };
    }

    return {
      status: 200,
      message: "Booking deleted",
      authServiceUserId: booking.getId(),
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: "Something went wrong with booking delete",
    };
  }
};
