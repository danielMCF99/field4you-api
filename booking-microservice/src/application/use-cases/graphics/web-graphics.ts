import { Request } from 'express';
import {
  bookingRepository,
  sportsVenueRepository,
  userRepository,
} from '../../../app';
import { WebGraphicsResponseDTO } from '../../../domain/dtos/web-graphics.dto';
import { UserType } from '../../../domain/entities/User';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { UnauthorizedException } from '../../../domain/exceptions/UnauthorizedException';

export const getWebGraphics = async (
  req: Request
): Promise<WebGraphicsResponseDTO> => {
  const userType = req.headers['x-user-type'] as string | undefined;
  if (!userType || userType !== UserType.admin) {
    throw new UnauthorizedException(
      'Only admin user is allowed to access application usage graphics'
    );
  }

  try {
    const [
      numberOfUsers,
      numberOfOwners,
      numberOfBookings,
      numberOfSportsVenues,
      bookingsByType,
    ] = await Promise.all([
      userRepository.countUsersByTypeUser(),
      userRepository.countUsersByTypeOwner(),
      bookingRepository.countBookings(),
      sportsVenueRepository.countSportsVenues(),
      bookingRepository.countBookingsByMonthAndType(),
    ]);

    return {
      totalPlayers: numberOfUsers,
      totalManagers: numberOfOwners,
      totalBookings: numberOfBookings,
      totalSportsVenues: numberOfSportsVenues,
      bookingsByTypePerMonth: bookingsByType,
    };
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException(
      'Server error obtaining graphics statistics'
    );
  }
};
