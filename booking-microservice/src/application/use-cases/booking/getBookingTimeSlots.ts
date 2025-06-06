import { Request } from 'express';
import { bookingRepository } from '../../../app';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';

export const getBookingTimeSlots = async (
  req: Request
): Promise<{ startTime: string; endTime: string }[]> => {
  const { sportsVenueId, date } = req.query;

  if (!sportsVenueId || !date) {
    throw new BadRequestException('sportsVenueId and date are required');
  }

  const parsedDate = new Date(date.toString());
  if (isNaN(parsedDate.getTime())) {
    throw new BadRequestException('Invalid date format');
  }

  return await bookingRepository.getBookedTimeSlotsForDay(
    sportsVenueId.toString(),
    parsedDate
  );
};
