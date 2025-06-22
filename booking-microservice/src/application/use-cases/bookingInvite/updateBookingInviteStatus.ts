import { Request } from 'express';
import mongoose from 'mongoose';
import { bookingInviteRepository, bookingRepository } from '../../../app';
import {
  BookingInvite,
  BookingInviteStatus,
} from '../../../domain/entities/BookingInvite';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../../domain/exceptions/UnauthorizedException';
import { validateBookingInviteStatusTransition } from '../../../infrastructure/utils/bookingInviteUtils';
import { UserType } from '../../../domain/entities/User';

export const updateBookingInviteStatus = async (
  req: Request
): Promise<BookingInvite> => {
  const id = req.params.id.toString();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }

  const allowedFields = ['status', 'comments'];

  const updatedData: Record<string, any> = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updatedData[key] = req.body[key];
    }
  });

  const newStatus = updatedData.status;
  const comments = updatedData.comments;
  if (
    !newStatus ||
    (newStatus != BookingInviteStatus.accepted &&
      newStatus != BookingInviteStatus.rejected)
  ) {
    throw new BadRequestException('Invalid status update request');
  }

  const ownerId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;
  if (!ownerId || !userType) {
    throw new InternalServerErrorException(
      'Internal Server Error. Missing required authentication headers'
    );
  }

  const bookingInvite = await bookingInviteRepository.findById(id);

  if (!bookingInvite) {
    throw new NotFoundException(
      'Booking with given ID not found for authenticated user'
    );
  }

  if (userType != UserType.admin) {
    // Check if booking invite belongs to the user
    if (bookingInvite.getUserId() != ownerId) {
      throw new UnauthorizedException(
        'Authenticated user is not the owner of the invite'
      );
    }
  }

  if (bookingInvite.bookingEndDate < new Date()) {
    throw new ForbiddenException(
      'Unable to change status of booking invite associated to already completed booking'
    );
  }

  const isValidStatusTransition = validateBookingInviteStatusTransition(
    bookingInvite.status,
    newStatus
  );
  if (!isValidStatusTransition) {
    throw new BadRequestException('Invalid status transition');
  }

  try {
    const updatedBookingInvite = await bookingInviteRepository.updateStatus(
      id,
      newStatus,
      comments ? comments : null
    );

    if (!updatedBookingInvite) {
      throw new InternalServerErrorException('Error updating booking invite');
    }

    if (updatedBookingInvite.status === BookingInviteStatus.rejected) {
      const booking = await bookingRepository.findById(
        updatedBookingInvite.bookingId
      );

      if (!booking) {
        throw new InternalServerErrorException('Booking not found');
      }

      const filteredInvitedUsers = booking.invitedUsersIds.filter(
        (userId) => userId !== bookingInvite.getUserId()
      );

      // Atualizar só o campo invitedUsersIds
      await bookingRepository.update(updatedBookingInvite.bookingId, {
        invitedUsersIds: filteredInvitedUsers,
      });
    }

    return updatedBookingInvite;
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException(
      'Internal server error updating booking invite'
    );
  }
};
