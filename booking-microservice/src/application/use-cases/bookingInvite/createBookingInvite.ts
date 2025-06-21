import mongoose from 'mongoose';
import { bookingInviteRepository, userRepository } from '../../../app';
import { BookingInviteStatus } from '../../../domain/entities/BookingInvite';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { sendFcmMessage } from './sendPushNotification';

export const createBookingInvite = async (
  invitedUsersIds: string[],
  bookingInfo: {
    bookingId: string;
    sportsVenueId?: string;
    sportsVenueName?: string;
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
  try {
    // Create BookingInvites
    const bookingInvites: any = [];
    const newlyInvitedUsers: string[] = [];

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
          sportsVenueId: bookingInfo.sportsVenueId,
          sportsVenueName: bookingInfo.sportsVenueName,
          bookingStartDate: bookingInfo.bookingStartDate,
          bookingEndDate: bookingInfo.bookingEndDate,
          userId: id,
          status: BookingInviteStatus.pending,
        });
        newlyInvitedUsers.push(id);
      }
    }
    await bookingInviteRepository.insertMany(bookingInvites, session);

    // Send push notifications only to newly invited users
    for (const userId of newlyInvitedUsers) {
      const user = await userRepository.getById(userId);

      if (user && user?.pushNotificationToken) {
        sendFcmMessage(
          user.pushNotificationToken,
          'You have been invited to a new booking!',
          bookingInfo.bookingId
        );
      }
    }

    return true;
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException(
      'Internal server error creating booking invite'
    );
  }
};
