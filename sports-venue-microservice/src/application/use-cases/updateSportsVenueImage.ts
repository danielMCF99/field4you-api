import { Request } from 'express';
import mongoose from 'mongoose';
import { firebase, sportsVenueRepository } from '../../app';
import { SportsVenue } from '../../domain/entities/SportsVenue';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { ForbiddenException } from '../../domain/exceptions/ForbiddenException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';

export const updateSportsVenueImage = async (
  req: Request
): Promise<SportsVenue> => {
  const id = req.params.id.toString();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid user ID format');
  }

  const ownerId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;

  if (!ownerId || !userType) {
    throw new InternalServerErrorException(
      'Internal Server Error. Missing required authentication headers'
    );
  }

  if (userType != 'owner' && userType !== 'admin') {
    throw new ForbiddenException(
      'Regular User is not allowed to delete this venue'
    );
  }

  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    throw new BadRequestException('At least one image is required');
  }

  const sportsVenue = await sportsVenueRepository.findById(id);
  if (!sportsVenue) {
    throw new NotFoundException('Sports Venue not found');
  }

  if (sportsVenue.ownerId != ownerId) {
    throw new UnauthorizedException(
      'User is not authorized to update this venue'
    );
  }

  try {
    const uploadResults = await firebase.uploadFilesToFirebase(req);

    if (!uploadResults || uploadResults.length === 0) {
      throw new BadRequestException('Upload failed');
    }

    const updatedImages = [
      ...(sportsVenue.sportsVenuePictures || []),
      ...uploadResults,
    ];

    const updatedSportsVenue =
      await sportsVenueRepository.updateSportsVenueImage(id, {
        sportsVenuePictures: updatedImages,
      });

    if (!updatedSportsVenue) {
      throw new InternalServerErrorException(
        'Failed to update Sports Venue images'
      );
    }

    return updatedSportsVenue;
  } catch (error) {
    throw new InternalServerErrorException(
      'Unexpected error during images updates'
    );
  }
};
