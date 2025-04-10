import { Request } from 'express';
import mongoose from 'mongoose';
import { sportsVenueRepository } from '../../app';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { ForbiddenException } from '../../domain/exceptions/ForbiddenException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { publishSportsVenueDeletion } from '../../infrastructure/middlewares/rabbitmq.publisher';

export const deleteSportsVenue = async (req: Request): Promise<boolean> => {
  const id = req.params.id.toString();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }

  const ownerId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;
  if (!ownerId || !userType) {
    throw new InternalServerErrorException('Internal Server Error');
  }

  const sportsVenue = await sportsVenueRepository.findById(id);
  if (!sportsVenue) {
    throw new NotFoundException('Sports Venue with given ID not found');
  }

  if (userType != 'owner') {
    throw new ForbiddenException(
      'Regular User is not allowed to delete this venue'
    );
  }

  if (sportsVenue.ownerId.toString() !== ownerId.toString()) {
    throw new UnauthorizedException(
      'Sports Venue does not belong to the current user'
    );
  }

  try {
    const deletedSportsVenue = await sportsVenueRepository.delete(id);
    if (deletedSportsVenue == null) {
      throw new NotFoundException('Sports Venue with given ID not found');
    }

    publishSportsVenueDeletion({ sportsVenueId: id, ownerId });

    return true;
  } catch (error) {
    throw new InternalServerErrorException(
      'Internal server error deleting sports venue'
    );
  }
};
