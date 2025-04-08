import { Request } from 'express';
import mongoose from 'mongoose';
import { bookingRepository } from '../../app';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';

export const deleteBooking = async (req: Request): Promise<Boolean> => {
  const id = req.params.id.toString();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }

  const ownerId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;
  if (!ownerId || !userType) {
    throw new InternalServerErrorException('Internal Server Error');
  }

  try {
    if (userType != 'admin') {
      // Check if booking belongs to the user
      const booking = await bookingRepository.findByIdAndOwnerId(id, ownerId);
      if (!booking) {
        throw new NotFoundException(
          'Booking with given ID not found for authenticated user'
        );
      }
    }

    const isDeleted = await bookingRepository.delete(id);
    if (!isDeleted) {
      throw new BadRequestException('Error deleting booking');
    }

    return true;
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw new Error('Error deleting booking');
    } else if (error instanceof UnauthorizedException) {
      throw new Error('Error deleting booking');
    } else {
      throw new InternalServerErrorException('Error deleting booking');
    }
  }
};
