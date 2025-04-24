import mongoose from 'mongoose';
import { bookingInviteRepository, userRepository } from '../../../app';
import { BookingInviteStatus } from '../../../domain/entities/BookingInvite';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';

export const createBookingInvite = async (
  invitedUsersIds: string[],
  bookingInfo: {
    bookingId: string;
    bookingStartDate?: Date;
    bookingEndDate?: Date;
  },
  session?: mongoose.ClientSession
): Promise<Boolean> => {
  // Check if any of the invited users does not exist
  const nonExistingUsers = await Promise.all(
    invitedUsersIds.map(async (id: string) => {
      const user = await userRepository.getById(id);
      return user === undefined;
    })
  );

  const hasNonExistingUsers = nonExistingUsers.some((val) => val === true);
  if (hasNonExistingUsers) {
    throw new NotFoundException(
      'You have invited at least one user that does not exist'
    );
  }
  console.log('Here 2');
  try {
    // Create BookingInvites
    const bookingInvites: any = [];

    for (const id of invitedUsersIds) {
      const exists = await bookingInviteRepository.existsByBookingIdAndUserId(
        bookingInfo.bookingId,
        id
      );
      if (exists) {
        if (bookingInfo.bookingStartDate || bookingInfo.bookingEndDate) {
          await bookingInviteRepository.update(bookingInfo.bookingId, id, {
            bookingStartDate: bookingInfo.bookingStartDate,
            bookingEndDate: bookingInfo.bookingEndDate,
          });
        }
      } else {
        bookingInvites.push({
          bookingId: bookingInfo.bookingId,
          bookingStartDate: bookingInfo.bookingStartDate,
          bookingEndDate: bookingInfo.bookingEndDate,
          userId: id,
          status: BookingInviteStatus.pending,
        });
      }
    }
    await bookingInviteRepository.insertMany(bookingInvites, session);

    return true;
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException(
      'Internal server error creating booking invite'
    );
  }
};
