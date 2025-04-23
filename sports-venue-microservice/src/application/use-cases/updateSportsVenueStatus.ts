import { Request } from 'express';
import mongoose from 'mongoose';
import { sportsVenueRepository } from '../../app';
import { SportsVenue } from '../../domain/entities/sports-venue';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { publishSportsVenueUpdate } from '../../infrastructure/rabbitmq/rabbitmq.publisher';

export const updateSportsVenueStatus = async (
  req: Request
): Promise<SportsVenue> => {
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

  const { status } = req.body;
  if (!status || (status != 'active' && status != 'inactive')) {
    throw new BadRequestException('Invalid status update request');
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
    const updatedSportsVenue = await sportsVenueRepository.update(id, {
      ...sportsVenue,
      ...{ status: status },
    });
    if (!updatedSportsVenue) {
      throw new InternalServerErrorException('Failed to update Sports Venue');
    }
    publishSportsVenueUpdate({
      sportsVenueId: id,
      ownerId: sportsVenue.ownerId,
      updatedData: {
        status,
      },
    });
    return updatedSportsVenue;
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException(
      'Internal server error updating sports venue status'
    );
  }
};
