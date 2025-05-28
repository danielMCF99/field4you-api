import { eachDayOfInterval, formatISO, subDays } from 'date-fns';
import { Request } from 'express';
import { sportsVenueRepository } from '../../../app';
import { RecentBookingsResponseDTO } from '../../../domain/dtos/recent-bookings.dto';
import { BookingStatus } from '../../../domain/entities/Booking';
import { UserType } from '../../../domain/entities/User';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { BookingModel } from '../../../infrastructure/database/models/booking.model';

const ALLOWED_STATUS = [BookingStatus.confirmed, BookingStatus.done];

export const getRecentBookings = async (
  req: Request
): Promise<RecentBookingsResponseDTO> => {
  console.time('getRecentBookings');
  const sportsVenueOwnerId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;

  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const sixtyDaysAgo = subDays(now, 60);

  console.log(thirtyDaysAgo);
  console.log(sixtyDaysAgo);

  if (!userType) {
    throw new ForbiddenException('User is not allowed to perform this request');
  }

  if (userType != UserType.admin && userType != UserType.owner) {
    throw new ForbiddenException('User is not allowed to perform this request');
  }

  try {
    let sportsVenueIds: string[] = [];

    if (userType === UserType.owner) {
      console.log('Getting bookings for sports venue of specific owner');
      console.time('fetch-venues');
      const venues = await sportsVenueRepository.findAll(sportsVenueOwnerId);
      console.timeEnd('fetch-venues');
      sportsVenueIds = venues.map((venue) => venue.getId());
    } else {
      console.log('Getting all bookings for all sports venue');
      console.time('fetch-venues');
      const venues = await sportsVenueRepository.findAll();
      console.timeEnd('fetch-venues');
      sportsVenueIds = venues.map((venue) => venue.getId());
    }

    const venueFilter =
      sportsVenueIds.length > 0
        ? { sportsVenueId: { $in: sportsVenueIds } }
        : {};
    console.time('bookings-stats');
    const [currentMonthBookings, lastMonthBookings, dailyBookings] =
      await Promise.all([
        BookingModel.countDocuments({
          ...venueFilter,
          status: { $in: ALLOWED_STATUS },
          bookingStartDate: { $gte: thirtyDaysAgo, $lte: now },
        }),
        BookingModel.countDocuments({
          ...venueFilter,
          status: { $in: ALLOWED_STATUS },
          bookingStartDate: { $gte: sixtyDaysAgo, $lte: thirtyDaysAgo },
        }),
        getDailyActivity(thirtyDaysAgo, now),
      ]);
    console.timeEnd('bookings-stats');
    const percentageDifference =
      lastMonthBookings === 0
        ? currentMonthBookings === 0
          ? 0
          : 100
        : ((currentMonthBookings - lastMonthBookings) / lastMonthBookings) *
          100;

    console.timeEnd('getRecentBookings');
    return {
      currentMonthBookings: currentMonthBookings,
      previousMonthBookings: lastMonthBookings,
      percentageDifference: Number(percentageDifference.toFixed(2)),
      dailyBookings: dailyBookings,
    };
  } catch (error: any) {
    console.log(error);
    console.timeEnd('getRecentBookings');
    throw new InternalServerErrorException(
      'Internal server error fetching recent bookings'
    );
  }
};

const getDailyActivity = async (start: Date, end: Date) => {
  const bookings = await BookingModel.aggregate([
    {
      $match: {
        bookingStartDate: {
          $gte: start,
          $lte: end,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$bookingStartDate' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const daysInMonth = eachDayOfInterval({ start, end }).map((day) => ({
    date: formatISO(day, { representation: 'date' }),
    count: 0,
  }));

  const countsMap = new Map(bookings.map((u) => [u._id, u.count]));
  return daysInMonth.map((day) => ({
    date: day.date,
    count: countsMap.get(day.date) || 0,
  }));
};
