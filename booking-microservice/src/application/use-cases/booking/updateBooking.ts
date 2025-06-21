import { Request } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import {
  bookingRepository,
  bookingInviteRepository,
  sportsVenueRepository,
} from '../../../app';
import {
  UpdateBookingDTO,
  updateBookingSchema,
} from '../../../domain/dtos/update-booking.dto';
import { Booking } from '../../../domain/entities/Booking';
import { UserType } from '../../../domain/entities/User';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { ConflictException } from '../../../domain/exceptions/ConflictException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../../domain/exceptions/UnauthorizedException';
import { createBookingInvite } from '../bookingInvite/createBookingInvite';
import { checkBookingConflicts } from './checkBookingConflicts';
import {
  publishBookingInvitesAdded,
  publishBookingInvitesRemoved,
} from '../../../infrastructure/rabbitmq/rabbitmq.publisher';

export const updateBooking = async (req: Request): Promise<Booking> => {
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

  let booking;
  if (userType != UserType.admin) {
    // Check if booking belongs to the user
    booking = await bookingRepository.findByIdAndOwnerId(id, ownerId);
    if (!booking) {
      throw new NotFoundException(
        'Booking with given ID not found for authenticated user'
      );
    }
  } else {
    booking = await bookingRepository.findById(id);
  }

  if (!booking) {
    throw new NotFoundException('Booking not found');
  }

  if (booking.bookingEndDate < new Date()) {
    throw new UnauthorizedException(
      'Not allowed to update booking that is done'
    );
  }

  let parsed: UpdateBookingDTO;
  try {
    parsed = updateBookingSchema.parse(req.body);
  } catch (error) {
    if (error instanceof ZodError) {
      const missingFields = error.errors.map((err) => err.path.join('.'));
      throw new BadRequestException('Missing or invalid required fields', {
        missingFields,
      });
    }

    throw new InternalServerErrorException(
      'Unexpected error parsing request data'
    );
  }

  const {
    bookingType,
    title,
    bookingStartDate,
    bookingEndDate,
    isPublic,
    invitedUsersIds,
  } = parsed;

  // Identify new users to invite and users to remove
  let newInvitedUsersIds: string[] = [];
  let removedUsersIds: string[] = [];

  if (parsed.invitedUsersIds !== undefined) {
    const newList = parsed.invitedUsersIds || [];
    const currentList = booking.invitedUsersIds || [];

    // Find new users (in new list but not in current list)
    newInvitedUsersIds = newList.filter(
      (userId) => !currentList.includes(userId)
    );

    // Find removed users (in current list but not in new list)
    removedUsersIds = currentList.filter((userId) => !newList.includes(userId));
  }

  /*const isSportsVenueIdChanged =
    updatedData.sportsVenueId &&
    updatedData.sportsVenueId !== booking.sportsVenueId;*/

  const isStartDateChanged =
    parsed.bookingStartDate &&
    new Date(parsed.bookingStartDate).getTime() !==
      new Date(booking.bookingStartDate).getTime();
  const isEndDateChanged =
    parsed.bookingEndDate &&
    new Date(parsed.bookingEndDate).getTime() !==
      new Date(booking.bookingEndDate).getTime();

  /*if (isSportsVenueIdChanged) {
    // Check if Sports Venue Exists
    const sportsVenue = await sportsVenueRepository.findById(
      updatedData.sportsVenueId
    );
    if (!sportsVenue) {
      throw new NotFoundException('Sports Venue for given Booking not found');
    }*/

  if (isStartDateChanged || isEndDateChanged) {
    const hasConflicts = await checkBookingConflicts(
      bookingRepository,
      booking.sportsVenueId,
      new Date(parsed.bookingStartDate || booking.bookingStartDate),
      new Date(parsed.bookingEndDate || booking.bookingEndDate),
      id
    );

    if (hasConflicts) {
      throw new ConflictException('Booking conflicts found');
    }
  }

  // Get sports venue information for invites
  const sportsVenue = await sportsVenueRepository.findById(
    booking.sportsVenueId
  );
  if (!sportsVenue) {
    throw new NotFoundException('Sports Venue not found');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedBooking = await bookingRepository.update(
      booking.getId(),
      {
        bookingType: bookingType,
        title: title,
        bookingStartDate: bookingStartDate
          ? new Date(bookingStartDate)
          : undefined,
        bookingEndDate: bookingEndDate ? new Date(bookingEndDate) : undefined,
        isPublic: isPublic,
        invitedUsersIds: invitedUsersIds,
      },
      session
    );
    if (!updatedBooking) {
      throw new InternalServerErrorException('Error updating booking');
    }

    // Remove invites for users that were removed from the list
    if (removedUsersIds.length > 0) {
      const deletedInvites =
        await bookingInviteRepository.bulkDeleteByBookingIdAndUserIds(
          updatedBooking.getId(),
          removedUsersIds,
          session
        );
      console.log(
        `Removed ${deletedInvites.deletedCount} invites for removed users`
      );
    }

    // Only create invites for new users, not existing ones
    if (newInvitedUsersIds.length > 0) {
      await createBookingInvite(
        newInvitedUsersIds,
        {
          bookingId: updatedBooking.getId(),
          sportsVenueId: sportsVenue.getId(),
          sportsVenueName: sportsVenue.sportsVenueName,
          bookingStartDate: updatedBooking.bookingStartDate,
          bookingEndDate: updatedBooking.bookingEndDate,
        },
        session
      );
    }

    // Update existing invites if booking dates changed
    if (
      (isStartDateChanged || isEndDateChanged) &&
      updatedBooking.invitedUsersIds &&
      updatedBooking.invitedUsersIds.length > 0
    ) {
      await createBookingInvite(
        updatedBooking.invitedUsersIds,
        {
          bookingId: updatedBooking.getId(),
          sportsVenueId: sportsVenue.getId(),
          sportsVenueName: sportsVenue.sportsVenueName,
          bookingStartDate: updatedBooking.bookingStartDate,
          bookingEndDate: updatedBooking.bookingEndDate,
        },
        session
      );
    }

    // Commit DB Transaction
    await session.commitTransaction();
    session.endSession();

    // Publish events for data replication to sports-venue-microservice
    if (removedUsersIds.length > 0) {
      await publishBookingInvitesRemoved({
        bookingId: updatedBooking.getId(),
        sportsVenueId: sportsVenue.getId(),
        removedUserIds: removedUsersIds,
      });
    }

    if (newInvitedUsersIds.length > 0) {
      await publishBookingInvitesAdded({
        bookingId: updatedBooking.getId(),
        sportsVenueId: sportsVenue.getId(),
        addedUserIds: newInvitedUsersIds,
        bookingStartDate: updatedBooking.bookingStartDate,
      });
    }

    // Get final state of booking with all invited users
    const response = await bookingRepository.findById(id);

    if (!response) {
      throw new InternalServerErrorException(
        'Error fetching final version of booking after update'
      );
    }

    return response;
  } catch (error) {
    // Abort DB Transaction
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    throw new InternalServerErrorException(
      'Internal server error updating booking'
    );
  }
};
