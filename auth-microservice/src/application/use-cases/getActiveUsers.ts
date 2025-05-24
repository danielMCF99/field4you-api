import { eachDayOfInterval, formatISO, subDays } from 'date-fns';
import { Request } from 'express';
import { ActiveUsersResponseDTO } from '../../domain/dtos/active-users.dto';
import { UserType } from '../../domain/entities/Auth';
import { ForbiddenException } from '../../domain/exceptions/ForbiddenException';
import { LoginHistoryModel } from '../../infrastructure/database/models/login-history.model';

export const getActiveUsers = async (
  req: Request
): Promise<ActiveUsersResponseDTO> => {
  const userType = req.headers['x-user-type'];

  if (!userType || userType != UserType.admin) {
    throw new ForbiddenException('User is not allowed to perform this request');
  }

  const now = new Date();
  const currentPeriodStart = subDays(now, 30);
  const previousPeriodStart = subDays(currentPeriodStart, 30);
  const previousPeriodEnd = currentPeriodStart;

  const [currentActiveUsers, previousActiveUsers, dailyBreakdown] =
    await Promise.all([
      LoginHistoryModel.countDocuments({
        loginDate: {
          $gte: currentPeriodStart,
          $lte: now,
        },
      }),
      LoginHistoryModel.countDocuments({
        loginDate: {
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
  const users = await LoginHistoryModel.aggregate([
    {
      $match: {
        loginDate: {
          $gte: start,
          $lte: end,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$loginDate' },
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
