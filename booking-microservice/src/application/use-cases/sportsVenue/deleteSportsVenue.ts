import { SportsVenue } from '../../../domain/entities/SportsVenue';
import {
  bookingInviteRepository,
  bookingRepository,
  sportsVenueRepository,
} from '../../../app';
import mongoose from 'mongoose';
import { BookingInviteStatus } from '../../../domain/entities/BookingInvite';

export const deleteSportsVenue = async (
  id: string
): Promise<SportsVenue | null> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Find all active pending bookings for sportsVenues
    const activeBookings = await bookingRepository.findAllActiveByVenueIds([
      id,
    ]);

    const bookingIds = activeBookings.map((b) => b.getId());

    // Reject invites associated to bookings
    const updatedInvitesByBookingIds =
      await bookingInviteRepository.bulkUpdateStatusByBookingIds(
        bookingIds,
        BookingInviteStatus.rejected,
        'Invites rejected due to sports venue deletion',
        session
      );

    // Cancel bookings
    const canceledBookingsByIds = await bookingRepository.bulkStatusUpdateByIds(
      bookingIds,
      session
    );

    console.log(
      `${updatedInvitesByBookingIds.modifiedCount} invites updated by booking ids.`
    );
    console.log(
      `${canceledBookingsByIds.modifiedCount} canceled bookings by id.`
    );

    return await sportsVenueRepository.delete(id);
  } catch (error) {
    console.error(error);
    return null;
  }
};
