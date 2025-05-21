import { Request } from 'express';
import mongoose from 'mongoose';
import {
  bookingInviteRepository,
  bookingRepository,
  sportsVenueRepository,
} from '../../../app';
import { Booking, BookingStatus } from '../../../domain/entities/Booking';
import { BookingInviteStatus } from '../../../domain/entities/BookingInvite';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { ConflictException } from '../../../domain/exceptions/ConflictException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../../domain/exceptions/UnauthorizedException';
import { publishFinishedBooking } from '../../../infrastructure/rabbitmq/rabbitmq.publisher';
import { validateBookingStatusTransition } from '../../../infrastructure/utils/bookingUtils';
import { checkBookingConflicts } from './checkBookingConflicts';
import { UserType } from '../../../domain/entities/User';

export const updateBookingStatus = async (req: Request): Promise<Booking> => {
  const id = req.params.id.toString();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }

  const allowedFields = ['status'];

  const updatedData: Record<string, any> = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updatedData[key] = req.body[key];
    }
  });

  const newStatus = updatedData.status;
  const validStatus = [
    BookingStatus.active,
    BookingStatus.cancelled,
    BookingStatus.done,
    BookingStatus.confirmed,
  ];

  if (!newStatus || !validStatus.includes(newStatus)) {
    throw new BadRequestException('Invalid status update request');
  }

  const ownerId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;
  if (ownerId) {
  }

  if (newStatus === BookingStatus.confirmed) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const sportsVenue = await sportsVenueRepository.findById(
      booking.sportsVenueId
    );
    if (!sportsVenue) {
      throw new NotFoundException('Sports venue not found');
    }
    if (!sportsVenue.ownerId) {
      throw new NotFoundException('Sports venue owner not found');
    }
    if (sportsVenue.ownerId.toString() !== ownerId?.toString()) {
      throw new UnauthorizedException(
        'Only the owner of the sports venue can confirm this booking'
      );
    }
  }

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

  const isValidStatusTransition = validateBookingStatusTransition(
    booking.status,
    newStatus
  );
  console.log('Valid', isValidStatusTransition);
  if (!isValidStatusTransition) {
    throw new BadRequestException('Invalid status transition');
  }

  // Check for potential conflicts when activating a Booking
  if (newStatus == BookingStatus.active) {
    const hasConflicts = await checkBookingConflicts(
      bookingRepository,
      booking.sportsVenueId,
      booking.bookingStartDate,
      booking.bookingEndDate,
      booking.getId()
    );

    if (hasConflicts) {
      throw new ConflictException('Booking conflicts with existing bookings');
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const updatedBooking = await bookingRepository.updateStatus(id, newStatus);
    if (!updatedBooking) {
      throw new InternalServerErrorException('Error updating booking');
    }

    let updatedInvites;
    let pendingInvites;
    let invitesIDs;
    switch (newStatus) {
      case BookingStatus.done:
        const acceptedInvites = await bookingInviteRepository.findAll({
          status: BookingInviteStatus.accepted,
          bookingId: booking.getId(),
        });

        const invitedUsersPayload = [];
        for (const invite of acceptedInvites) {
          invitedUsersPayload.push({
            userId: invite.getUserId(),
            bookingId: invite.getBookingId(),
            sportsVenueId: booking.sportsVenueId,
          });
        }

        console.log(
          `Booking status changed to done. Invited users payload for sports venue service: ${invitedUsersPayload}`
        );

        await publishFinishedBooking({
          invitedUserIds: invitedUsersPayload,
        });

        console.log(
          'Updating pending invites to rejected because booking is considered done'
        );

        pendingInvites = await bookingInviteRepository.findAll({
          status: BookingInviteStatus.pending,
          bookingId: id,
        });
        invitesIDs = pendingInvites.map((elem) => elem.getId());

        updatedInvites = await bookingInviteRepository.bulkUpdateStatusByIds(
          invitesIDs,
          BookingInviteStatus.rejected,
          'Booking status was updated to done and invite was in pending status',
          session
        );
        console.log(
          `Number of pending invites updated to rejected: ${updatedInvites.modifiedCount}`
        );

      case BookingStatus.cancelled:
        console.log(
          'Updating pending invites to rejected because booking is considered cancelled'
        );

        pendingInvites = await bookingInviteRepository.findAll({
          status: BookingInviteStatus.pending,
          bookingId: id,
        });
        invitesIDs = pendingInvites.map((elem) => elem.getId());

        updatedInvites = await bookingInviteRepository.bulkUpdateStatusByIds(
          invitesIDs,
          BookingInviteStatus.rejected,
          'Booking status was updated to done and invite was in pending status',
          session
        );
        console.log(
          `Number of pending invites updated to rejected: ${updatedInvites.modifiedCount}`
        );
        break;
      default:
        break;
    }

    // Commit DB Transaction
    await session.commitTransaction();
    session.endSession();

    return updatedBooking;
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
