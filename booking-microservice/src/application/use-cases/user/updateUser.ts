import {
  bookingInviteRepository,
  bookingRepository,
  sportsVenueRepository,
  userRepository,
} from '../../../app';
import { BookingStatus } from '../../../domain/entities/Booking';
import { BookingInviteStatus } from '../../../domain/entities/BookingInvite';
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
      console.time('inactivating-user');

      // Get all sports venue owned by userId
      const sportsVenues = await sportsVenueRepository.findAll(userId);

      if (sportsVenues && sportsVenues.length > 0) {
        const newVenueStatus =
          user.status == UserStatus.active
            ? SportsVenueStatus.active
            : SportsVenueStatus.inactive;

        await Promise.all(
          sportsVenues.map((venue) =>
            sportsVenueRepository.update(venue.getId(), {
              status: newVenueStatus,
            })
          )
        );

        if (user.status === UserStatus.inactive) {
          await Promise.all(
            sportsVenues.map(async (venue) => {
              const bookings = await bookingRepository.findAll({
                status: BookingStatus.active,
                sportsVenueId: venue.getId(),
                bookingStartDate: new Date(),
              });

              await Promise.all(
                bookings.map(async (booking) => {
                  await bookingRepository.updateStatus(
                    booking.getId(),
                    BookingStatus.cancelled
                  );

                  const invites = await bookingInviteRepository.findAll({
                    bookingId: booking.getId(),
                  });

                  await Promise.all(
                    invites.map((invite) =>
                      bookingInviteRepository.updateStatus(
                        invite.getId(),
                        BookingInviteStatus.rejected,
                        'Invited updated based on user status update'
                      )
                    )
                  );
                })
              );
            })
          );
        }
      }
    }
    console.timeEnd('inactivating-user');
    return updatedUser;
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};
