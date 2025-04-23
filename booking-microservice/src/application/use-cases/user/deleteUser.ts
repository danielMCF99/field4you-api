import mongoose from 'mongoose';
import {
  bookingInviteRepository,
  bookingRepository,
  sportsVenueRepository,
  userRepository,
} from '../../../app';
import { BookingInviteStatus } from '../../../domain/entities/BookingInvite';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';

export const deleteUser = async (id: string): Promise<Boolean> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Delete User from Database
    await userRepository.delete(id);

    // If user is owner of sports venue then delete them
    const sportsVenues = await sportsVenueRepository.findAll(id);
    const venuesIds = sportsVenues.map((v) => v.getId());

    const deletedVenues = await sportsVenueRepository.bulkDeleteByIds(
      venuesIds,
      session
    );

    // Find all active pending bookings for sportsVenues
    const activeBookings = await bookingRepository.findAllActiveByVenueIds(
      venuesIds
    );
    const bookingIds = activeBookings.map((b) => b.getId());

    // Reject invites associated to bookings
    const updatedInvitesByBookingIds =
      await bookingInviteRepository.bulkUpdateStatusByBookingIds(
        bookingIds,
        BookingInviteStatus.rejected,
        'Invites rejected due to user deletion',
        session
      );

    // Cancel bookings
    const canceledBookingsByIds = await bookingRepository.bulkStatusUpdateByIds(
      bookingIds,
      session
    );

    // Cancel bookings created by user in other venues
    const canceledBookingsByUserId = await bookingRepository.cancelByUserId(
      id,
      session
    );

    // Reject invites to user
    const rejectedInvitesByUserId =
      await bookingInviteRepository.bulkUpdateStatusByUserId(
        id,
        BookingInviteStatus.rejected,
        'Invite rejected due to user deletion',
        session
      );

    console.log(`${deletedVenues.deletedCount} venues deleted.`);
    console.log(
      `${updatedInvitesByBookingIds.modifiedCount} invites updated by booking ids.`
    );
    console.log(
      `${canceledBookingsByIds.modifiedCount} canceled bookings by id.`
    );
    console.log(
      `${canceledBookingsByUserId.modifiedCount} canceled bookings by userId.`
    );
    console.log(
      `${rejectedInvitesByUserId.modifiedCount} rejected invites by userId.`
    );

    await session.commitTransaction();
    session.endSession();
    return true;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new InternalServerErrorException(error.message);
  }
};
