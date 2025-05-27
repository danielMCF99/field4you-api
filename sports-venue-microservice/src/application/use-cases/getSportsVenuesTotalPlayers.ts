import { Request } from 'express';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { ForbiddenException } from '../../domain/exceptions/ForbiddenException';
import { TotalPlayersResponseDTO } from '../../domain/dtos/total-players.dto';
import { sportsVenueRepository } from '../../app';
import { subDays } from 'date-fns';
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

  // Obtain all sports venue of current user
  const sportsVenues = await sportsVenueRepository.findAll({
    ownerId: ownerId,
  });
  const sportsVenuesId = sportsVenues.sportsVenues.map((elem) => elem.getId());

  const [currentMonthTotalPlayers, previousMonthTotalPlayers, dailyBreakdown] =
    await Promise.all([
      await BookingInviteModel.countDocuments({
        sportsVenueId: { $in: sportsVenuesId },
        createdAt: {
          $gte: currentPeriodStart,
          $lte: now,
        },
      }),
      await BookingInviteModel.countDocuments({
        sportsVenueId: { $in: sportsVenuesId },
        createdAt: {
          $gte: previousPeriodStart,
          $lte: previousPeriodEnd,
        },
      }),
      [],
    ]);
  try {
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException('Internal Error');
  }
};
