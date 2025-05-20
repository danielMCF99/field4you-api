import { Request } from 'express';
import { WebGraphicsResponseDTO } from '../../../domain/dtos/web-graphics.dto';
import { UserType } from '../../../domain/entities/User';
import { UnauthorizedException } from '../../../domain/exceptions/UnauthorizedException';
import {
  bookingRepository,
  sportsVenueRepository,
  userRepository,
} from '../../../app';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';

export const getWebGraphics = async (
  req: Request
): Promise<WebGraphicsResponseDTO> => {
  const userType = req.headers['x-user-type'] as string | undefined;
  if (!userType || userType != UserType.admin) {
    throw new UnauthorizedException(
      'Only admin user is allowed to access application usage graphics'
    );
  }

  try {
    // Get number of regular users
    const numberOfUsers = await userRepository.countUsersByTypeUser();

    // Get number of owners
    const numberOfOwners = await userRepository.countUsersByTypeOwner();

    // Get done bookings
    const numberOfBookings = await bookingRepository.countBookings();

    // Get active sports venues
    const numberOfSportsVenues =
      await sportsVenueRepository.countSportsVenues();

    return {
      totalPlayers: numberOfUsers,
      totalManagers: numberOfOwners,
      totalBookings: numberOfBookings,
      totalSportsVenues: numberOfSportsVenues,
    };
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException(
      'Server error obtaining graphics statistics'
    );
  }
};
