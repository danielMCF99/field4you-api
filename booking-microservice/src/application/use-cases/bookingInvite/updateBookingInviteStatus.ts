import { Request } from 'express';
import mongoose from 'mongoose';
import { bookingInviteRepository } from '../../../app';
import { BookingInvite } from '../../../domain/entities/BookingInvite';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../../domain/exceptions/UnauthorizedException';

export const updateBookingInviteStatus = async (
  req: Request
): Promise<BookingInvite> => {
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
  if (
    !newStatus ||
    (newStatus != 'active' && newStatus != 'cancelled' && newStatus != 'done')
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

  if (userType != 'admin') {
    // Check if booking invite belongs to the user
    if (bookingInvite.getUserId() != ownerId) {
      throw new UnauthorizedException(
        'Authenticated user is not the owner of the invite'
      );
    }
  }

  try {
    const updatedBookingInvite = await bookingInviteRepository.updateStatus(
      id,
      newStatus
    );
    if (!updatedBookingInvite) {
      throw new InternalServerErrorException('Error updating booking invite');
    }

    return updatedBookingInvite;
  } catch (error) {
    throw new InternalServerErrorException(
      'Internal server error updating booking invite'
    );
  }
};
