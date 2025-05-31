import { eachDayOfInterval, formatISO, subDays } from 'date-fns';
import { Request } from 'express';
import { sportsVenueRepository } from '../../../app';
import { SportsVenueProfitResponseDTO } from '../../../domain/dtos/sports-venue-profit.dto';
import { BookingStatus } from '../../../domain/entities/Booking';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { BookingModel } from '../../../infrastructure/database/models/booking.model';

const ALLOWED_STATUS = [BookingStatus.done];

export const getSportsVenueProfit = async (
  req: Request
): Promise<SportsVenueProfitResponseDTO> => {
  const sportsVenueOwnerId = req.headers['x-user-id'] as string | undefined;
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const sixtyDaysAgo = subDays(now, 60);

  if (!sportsVenueOwnerId) {
    throw new InternalServerErrorException(
      'Internal Server Error. Owner identification header missing.'
    );
  }

  try {
    console.time('fetch-venues');
    const venues = await sportsVenueRepository.findAll(sportsVenueOwnerId);
    const sportsVenueIds = venues.map((venue) => venue.getId());
    console.timeEnd('fetch-venues');

    const [currentMonthProfit, previousMonthProfit, dailyProfits] =
      await Promise.all([
        BookingModel.aggregate([
          {
            $match: {
              status: { $in: ALLOWED_STATUS },
              sportsVenueId:
                sportsVenueIds.length > 0 ? { $in: sportsVenueIds } : undefined,
              bookingStartDate: { $gte: thirtyDaysAgo, $lte: now },
            },
          },
          {
            $group: {
              _id: null,
              totalProfit: { $sum: '$bookingPrice' },
            },
          },
        ]),
        BookingModel.aggregate([
          {
            $match: {
              status: { $in: ALLOWED_STATUS },
              sportsVenueId:
                sportsVenueIds.length > 0 ? { $in: sportsVenueIds } : undefined,
              bookingStartDate: { $gte: sixtyDaysAgo, $lte: thirtyDaysAgo },
            },
          },
          {
            $group: {
              _id: null,
              totalProfit: { $sum: '$bookingPrice' },
            },
          },
        ]),
        getDailyProfit(thirtyDaysAgo, now),
      ]);

    const currentTotal = currentMonthProfit[0]?.totalProfit || 0;
    const previousTotal = previousMonthProfit[0]?.totalProfit || 0;

    const percentageDifference =
      previousTotal === 0
        ? currentTotal === 0
          ? 0
          : 100
        : ((currentTotal - previousTotal) / previousTotal) * 100;

    return {
      currentMonthProfit: currentTotal,
      previousMonthProfit: previousTotal,
      percentageDifference: Number(percentageDifference.toFixed(2)),
      dailyProfits: dailyProfits,
    };
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException(
      'Internal server error fetching recent bookings'
    );
  }
};

const getDailyProfit = async (start: Date, end: Date) => {
  const bookings = await BookingModel.aggregate([
    {
      $match: {
        lastAccessDate: {
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
        dailyProfit: { $sum: '$bookingPrice' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const daysInMonth = eachDayOfInterval({ start, end }).map((day) => ({
    date: formatISO(day, { representation: 'date' }),
    dailyProfit: 0,
  }));

  const countsMap = new Map(bookings.map((u) => [u._id, u.dailyProfit]));
  return daysInMonth.map((day) => ({
    date: day.date,
    dailyProfit: countsMap.get(day.date) || 0,
  }));
};
