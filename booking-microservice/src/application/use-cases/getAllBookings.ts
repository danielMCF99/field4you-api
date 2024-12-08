import { IBookingRepository } from "../../domain/interfaces/BookingRepository";
import { Booking } from "../../domain/entities/Booking";

export const getAllBookings = async (
  repository: IBookingRepository
): Promise<Booking[]> => {
  try {
    const allBookings = await repository.findAll();
    return allBookings;
  } catch (error) {
    return [];
  }
};
