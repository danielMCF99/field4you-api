import { Request } from 'express';
import mongoose from 'mongoose';
import { sportsVenueRepository } from '../../app';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { SportsVenue, WeeklySchedule } from '../../domain/entities/SportsVenue';

interface ListSportsVenueScheduleResponse {
  weeklySchedule: WeeklySchedule;
}

export const getSportsVenueSchedule = async (
  req: Request
): Promise<ListSportsVenueScheduleResponse> => {
  const id = req.params.id.toString();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid sports venue ID format');
  }

  const sportsVenue = await sportsVenueRepository.findById(id);
  if (!sportsVenue) {
    throw new NotFoundException('Sports Venue not found');
  }

  if (!sportsVenue.weeklySchedule) {
    throw new NotFoundException(
      'This sports venue does not have a weekly schedule defined'
    );
  }

  return { weeklySchedule: sportsVenue.weeklySchedule };
};
