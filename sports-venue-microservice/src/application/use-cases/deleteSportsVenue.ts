import { Request } from 'express';
import mongoose from 'mongoose';
import { sportsVenueRepository } from '../../app';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { ForbiddenException } from '../../domain/exceptions/ForbiddenException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { publishSportsVenueDeletion } from '../../infrastructure/middlewares/rabbitmq.publisher';

export const deleteSportsVenue = async (
  req: Request
): Promise<{ status: number; message: string }> => {
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
    const sportsVenue = await sportsVenueRepository.findById(id);
    if (!sportsVenue) {
      throw new NotFoundException('Sports Venue with given ID not found');
    }

    if (sportsVenue.ownerId.toString() !== ownerId.toString()) {
      throw new UnauthorizedException(
        'User is not authorized to delete this venue'
      );
    }

    await sportsVenueRepository.delete(id);
    await publishSportsVenueDeletion({ sportsVenueId: id, ownerId });

    return { status: 200, message: 'Sports Venue Deleted' };
  } catch (error: any) {
    switch (error) {
      case error instanceof BadRequestException:
        throw new BadRequestException(error.message);

      case error instanceof UnauthorizedException:
        throw new UnauthorizedException(error.message);

      case error instanceof NotFoundException:
        throw new NotFoundException(error.message);

      case error instanceof ForbiddenException:
        throw new ForbiddenException(error.message);

      default:
        throw new InternalServerErrorException(
          'Something went wrong with sports-venue delete'
        );
    }
  }
};
