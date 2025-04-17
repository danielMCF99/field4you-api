import { Request } from 'express';
import mongoose from 'mongoose';
import { bookingInviteRepository, userRepository } from '../../../app';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';

export const createBookingInvite = async (
  req: Request,
  bookingInfo: {
    bookingId: string;
    bookingStartDate: Date;
    bookingEndDate: Date;
  },
  session?: mongoose.ClientSession
): Promise<Boolean> => {
  const { invitedUsersIds } = req.body;

  // Check invited user ids
  const invalidIds = invitedUsersIds.some(
    (id: string) => !mongoose.Types.ObjectId.isValid(id)
  );
  if (invalidIds.length > 0) {
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
    const bookingInvites = invitedUsersIds.map((id: string) => ({
      bookingId: bookingInfo.bookingId,
      bookingStartDate: bookingInfo.bookingStartDate,
      bookingEndDate: bookingInfo.bookingEndDate,
      userId: id,
      status: 'pending',
    }));

    await bookingInviteRepository.insertMany(bookingInvites, session);

    return true;
  } catch (error) {
    throw new InternalServerErrorException(
      'Internal server error creating booking invite'
    );
  }
};
