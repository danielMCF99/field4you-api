import { eachDayOfInterval, formatISO, subDays } from 'date-fns';
import { Request } from 'express';
import { sportsVenueRepository } from '../../app';
import { TotalPlayersResponseDTO } from '../../domain/dtos/total-players.dto';
import { ForbiddenException } from '../../domain/exceptions/ForbiddenException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { BookingInviteModel } from '../../infrastructure/database/models/booking-invite.model';

export const getSportsVenuesTotalPlayers = async (
  req: Request
): Promise<TotalPlayersResponseDTO> => {
  const ownerId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;
  if (!ownerId || !userType) {
    throw new InternalServerErrorException(
      'Internal Server Error. Missing required authentication headers'
    );
  }

  if (userType != 'Owner') {
    throw new ForbiddenException(
      'Only owners are allowed to check total number of players in sports venues'
    );
  }

  const now = new Date();
  const currentPeriodStart = subDays(now, 30);
  const previousPeriodStart = subDays(currentPeriodStart, 30);
  const previousPeriodEnd = currentPeriodStart;

  try {
    // Obtain all sports venue of current user
    const sportsVenues = await sportsVenueRepository.findAll({
      ownerId: ownerId,
    });
    const sportsVenuesId = sportsVenues.sportsVenues.map((elem) =>
      elem.getId()
    );

    const [
      currentMonthTotalPlayers,
      previousMonthTotalPlayers,
      dailyBreakdown,
    ] = await Promise.all([
      await BookingInviteModel.countDocuments({
        sportsVenueId: { $in: sportsVenuesId },
        bookingStartDate: {
          $gte: currentPeriodStart,
          $lte: now,
        },
      }),
      await BookingInviteModel.countDocuments({
        sportsVenueId: { $in: sportsVenuesId },
        bookingStartDate: {
          $gte: previousPeriodStart,
          $lte: previousPeriodEnd,
        },
      }),
      getDailyActivity(currentPeriodStart, now),
    ]);

    const percentageDifference =
      previousMonthTotalPlayers === 0
        ? currentMonthTotalPlayers === 0
          ? 0
          : 100
        : ((currentMonthTotalPlayers - previousMonthTotalPlayers) /
            previousMonthTotalPlayers) *
          100;

    return {
      currentMonthTotalPlayers: currentMonthTotalPlayers,
      previousMonthTotalPlayers: previousMonthTotalPlayers,
      percentageDifference: Number(percentageDifference.toFixed(2)),
      dailyTotalUsers: dailyBreakdown,
    };
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException('Internal Error');
  }
};

const getDailyActivity = async (start: Date, end: Date) => {
  const users = await BookingInviteModel.aggregate([
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

  const countsMap = new Map(users.map((u) => [u._id, u.count]));
  return daysInMonth.map((day) => ({
    date: day.date,
    count: countsMap.get(day.date) || 0,
  }));
};
