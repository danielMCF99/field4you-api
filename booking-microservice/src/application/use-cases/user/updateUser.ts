import {
  bookingRepository,
  sportsVenueRepository,
  userRepository,
} from '../../../app';
import { BookingStatus } from '../../../domain/entities/Booking';
import { SportsVenueStatus } from '../../../domain/entities/SportsVenue';
import { User, UserStatus } from '../../../domain/entities/User';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';

export const updateUser = async (
  userId: string,
  user: Partial<User>
): Promise<User | undefined> => {
  try {
    const updatedUser = await userRepository.update(userId, user);

    if (user.status) {
      // Get all sports venue owned by userId
      const sportsVenues = await sportsVenueRepository.findAll(userId);

      if (sportsVenues && sportsVenues.length > 0) {
        for (const venue of sportsVenues) {
          const newVenueStatus =
            user.status == UserStatus.active
              ? SportsVenueStatus.active
              : SportsVenueStatus.inactive;

          await sportsVenueRepository.update(venue.getId(), {
            status: newVenueStatus,
          });

          // Find all bookings associated to given sportsVenue and cancel them if necessary

          if (user.status == UserStatus.inactive) {
            const bookings = await bookingRepository.findAll({
              status: BookingStatus.active,
              sportsVenueId: venue.getId(),
              bookingStartDate: new Date(),
            });

            bookings.forEach((booking) => {
              bookingRepository.updateStatus(
                booking.getId(),
                BookingStatus.cancelled
              );
            });
          }
        }
      }
    }

    return updatedUser;
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};
