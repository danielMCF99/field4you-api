import { Request } from 'express';
import mongoose from 'mongoose';
import { bookingInviteRepository, bookingRepository } from '../../../app';
import { BookingInviteStatus } from '../../../domain/entities/BookingInvite';
import { UserType } from '../../../domain/entities/User';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';

export const deleteBooking = async (req: Request): Promise<Boolean> => {
  const id = req.params.id.toString();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }

  const ownerId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;
  if (!ownerId || !userType) {
    throw new InternalServerErrorException(
      'Internal Server Error. Missing required authentication headers'
    );
  }

  if (userType != UserType.admin) {
    throw new ForbiddenException(
      'Only admin users are allowed to delete bookings'
    );
  }

  // Check if booking belongs to the user
  const booking = await bookingRepository.findById(id);
  if (!booking) {
    throw new NotFoundException('Booking not found');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const isDeleted = await bookingRepository.delete(id);

    if (booking.bookingStartDate > new Date()) {
      const updatedInvitesByBookingIds =
        await bookingInviteRepository.bulkUpdateStatusByBookingIds(
          [booking.getId()],
          BookingInviteStatus.rejected,
          'Invites rejected due to user deletion',
          session
        );

      console.log(
        `${updatedInvitesByBookingIds.modifiedCount} invites rejected.`
      );
    }

    // Commit DB Transaction
    await session.commitTransaction();
    session.endSession();

    return isDeleted;
  } catch (error) {
    // Abort DB Transaction
    await session.abortTransaction();
    session.endSession();

    console.log(error);
    throw new InternalServerErrorException(
      'Internal server error deleting booking'
    );
  }
};
