import mongoose from 'mongoose';
import { bookingInviteRepository, userRepository } from '../../../app';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { BookingInviteStatus } from '../../../domain/entities/BookingInvite';

export const createBookingInvite = async (
  invitedUsersIds: string[],
  bookingInfo: {
    bookingId: string;
    bookingStartDate?: Date;
    bookingEndDate?: Date;
  },
  session?: mongoose.ClientSession
): Promise<Boolean> => {
  // Check invited user ids
  const invalidIds = invitedUsersIds.some(
    (id: string) => !mongoose.Types.ObjectId.isValid(id)
  );
  if (invalidIds) {
    throw new BadRequestException('Invalid user IDs');
  }

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
    throw new InternalServerErrorException(
      'Internal server error creating booking invite'
    );
  }
};
