import { IBookingRepository } from "../../domain/interfaces/BookingRepository";
import { Booking } from "../../domain/entities/Booking";

export const getBookingById = async (
  id: string,
  repository: IBookingRepository
): Promise<{ found: boolean; booking?: Booking }> => {
  try {
    const booking = await repository.findById(id);

    let foundBooking = true;
    if (!booking) {
      foundBooking = false;
    }
    return { found: foundBooking, booking: booking };
  } catch (error) {
    console.log(error);
    return { found: false, booking: undefined };
  }
};
