import { eachDayOfInterval, formatISO, subDays } from 'date-fns';
import { Request } from 'express';
import { ActiveUsersResponseDTO } from '../../domain/dtos/active-users.dto';
import { UserModel } from '../../infrastructure/database/models/user.model';

export const getActiveUsers = async (
  req: Request
): Promise<ActiveUsersResponseDTO> => {
  const now = new Date();
  const currentPeriodStart = subDays(now, 30);
  const previousPeriodStart = subDays(currentPeriodStart, 30);
  const previousPeriodEnd = currentPeriodStart;

  const [currentActiveUsers, previousActiveUsers, dailyBreakdown] =
    await Promise.all([
      UserModel.countDocuments({
        lastAccessDate: {
          $gte: currentPeriodStart,
          $lte: now,
        },
      }),
      UserModel.countDocuments({
        lastAccessDate: {
          $gte: previousPeriodStart,
          $lte: previousPeriodEnd,
        },
      }),
      getDailyActivity(currentPeriodStart, now),
    ]);

  const percentageDifference =
    previousActiveUsers === 0
      ? 100
      : ((currentActiveUsers - previousActiveUsers) / previousActiveUsers) *
        100;

  return {
    currentMonthActiveUsers: currentActiveUsers,
    previousMonthActiveUsers: previousActiveUsers,
    percentageDifference: Number(percentageDifference.toFixed(2)),
    dailyActiveUsers: dailyBreakdown,
  };
};

const getDailyActivity = async (start: Date, end: Date) => {
  const users = await UserModel.aggregate([
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
          $dateToString: { format: '%Y-%m-%d', date: '$lastAccessDate' },
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
