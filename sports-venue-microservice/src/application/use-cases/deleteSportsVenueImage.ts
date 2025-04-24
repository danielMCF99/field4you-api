import { Request } from 'express';
import mongoose from 'mongoose';
import { sportsVenueRepository } from '../../app';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';

export const deleteSportsVenueImage = async (req: Request): Promise<boolean> => {
  const id = req.params.id.toString();
  const imageId = req.params.imageId?.toString();

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(imageId)) {
    throw new BadRequestException('Invalid ID format');
  }

  const ownerId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;

  if (!ownerId || !userType) {
    throw new InternalServerErrorException(
      'Internal Server Error. Missing required authentication headers'
    );
  }

  const sportsVenue = await sportsVenueRepository.findById(id);
  if (!sportsVenue) {
    throw new NotFoundException('Sports Venue with given ID not found');
  }

  if (sportsVenue.ownerId.toString() !== ownerId.toString()) {
    throw new UnauthorizedException(
      'Sports Venue does not belong to the current user'
    );
  }

  try {
    const deletedSportsVenueImage = await sportsVenueRepository.deleteImage(id, imageId);
    if (deletedSportsVenueImage == null) {
      throw new NotFoundException('Sports Venue with given ID not found');
    }

    return true;
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException(
      'Internal server error deleting sports venue'
    );
  }
};
