import { IBookingRepository } from '../../../domain/interfaces/BookingRepository';

export const checkBookingConflicts = async (
  repository: IBookingRepository,
  sportsVenueId: string,
  bookingStartDate: Date,
  bookingEndDate: Date,
  idToExclude?: string
): Promise<boolean> => {
  const conflicts = await repository.findConflictingBookings(
    sportsVenueId,
    bookingStartDate,
    bookingEndDate,
    idToExclude
  );
  return conflicts.length > 0;
};
