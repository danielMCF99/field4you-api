import { subDays } from 'date-fns';
import { Request } from 'express';
import { sportsVenueRepository } from '../../../app';
import { RecentBookingsResponseDTO } from '../../../domain/dtos/recent-bookings.dto';
import { BookingStatus } from '../../../domain/entities/Booking';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { BookingModel } from '../../../infrastructure/database/models/booking.model';

const ALLOWED_STATUS = [BookingStatus.active, BookingStatus.done];

export const getRecentBookings = async (
  req: Request
): Promise<RecentBookingsResponseDTO> => {
  console.time('getRecentBookings');
  const sportsVenueOwnerId = req.headers['x-user-id'] as string | undefined;
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const sixtyDaysAgo = subDays(now, 60);

  try {
    let sportsVenueIds: string[] = [];

    if (sportsVenueOwnerId) {
      console.log('Getting bookings for sports venue of specific owner');
      console.time('fetch-venues');
      const venues = await sportsVenueRepository.findAll(sportsVenueOwnerId);
      console.timeEnd('fetch-venues');
      sportsVenueIds = venues.map((venue) => venue.getId());
    }

    console.time('bookings-stats');
    const [currentMonthBookings, lastMonthBookings, dailyRaw] =
      await Promise.all([
        BookingModel.countDocuments({
          status: { $in: ALLOWED_STATUS },
          sportsVenueId:
            sportsVenueIds.length > 0 ? { $in: sportsVenueIds } : undefined,
          bookingStartDate: { $gte: thirtyDaysAgo, $lte: now },
        }),
        BookingModel.countDocuments({
          status: { $in: ALLOWED_STATUS },
          sportsVenueId:
            sportsVenueIds.length > 0 ? { $in: sportsVenueIds } : undefined,
          bookingStartDate: { $gte: sixtyDaysAgo, $lte: thirtyDaysAgo },
        }),
        BookingModel.aggregate([
          {
            $match: {
              ...(sportsVenueIds.length > 0 && {
                sportsVenueId: { $in: sportsVenueIds },
              }),
              status: { $in: ALLOWED_STATUS },
              bookingStartDate: { $gte: thirtyDaysAgo, $lte: now },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$bookingStartDate',
                },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);
    console.timeEnd('bookings-stats');
    const dailyBookings = dailyRaw.map((d) => ({
      date: d._id,
      count: d.count,
    }));

    const percentageDifference =
      lastMonthBookings === 0
        ? currentMonthBookings > 0
          ? 100
          : 0
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

    throw new InternalServerErrorException(
      'Internal server error fetching recent bookings'
    );
  }
};
