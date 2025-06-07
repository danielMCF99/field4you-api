import { Request } from 'express';
import mongoose from 'mongoose';
import { sportsVenueRepository } from '../../app';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { ForbiddenException } from '../../domain/exceptions/ForbiddenException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { SportsVenue, WeeklySchedule } from '../../domain/entities/SportsVenue';
import { publishSportsVenueUpdate } from '../../infrastructure/rabbitmq/rabbitmq.publisher';

export const updateSportsVenueSchedule = async (
  req: Request
): Promise<SportsVenue> => {
  const id = req.params.id.toString();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid sports venue ID format');
  }

  const ownerId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;

  if (!ownerId || !userType) {
    throw new InternalServerErrorException(
      'Internal Server Error. Missing required authentication headers'
    );
  }

  if (userType !== 'Owner' && userType !== 'Admin') {
    throw new ForbiddenException(
      'You are not allowed to update a sports venue schedule'
    );
  }

  const sportsVenue = await sportsVenueRepository.findById(id);
  if (!sportsVenue) {
    throw new NotFoundException('Sports Venue not found');
  }

  if (userType !== 'admin' && sportsVenue.ownerId !== ownerId) {
    throw new UnauthorizedException(
      'You are not authorized to update this sports venue'
    );
  }

  const { weeklySchedule } = req.body as { weeklySchedule: WeeklySchedule };

  if (!weeklySchedule) {
    throw new BadRequestException('weeklySchedule field is required');
  }
  console.log(weeklySchedule);
  try {
    const updatedSportsVenue = await sportsVenueRepository.updateWeeklySchedule(
      id,
      weeklySchedule
    );

    if (!updatedSportsVenue) {
      throw new InternalServerErrorException(
        'Failed to update sports venue schedule'
      );
    }
    await publishSportsVenueUpdate({
      sportsVenueId: updatedSportsVenue.getId(),
      ownerId: updatedSportsVenue.ownerId,
      updatedData: {
        weeklySchedule: updatedSportsVenue.weeklySchedule,
      },
    });
    return updatedSportsVenue;
  } catch (error) {
    throw new InternalServerErrorException(
      'Unexpected error during schedule update'
    );
  }
};
