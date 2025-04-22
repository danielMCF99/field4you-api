import { sportsVenueRepository, userRepository } from '../../../app';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';

export const deleteUser = async (id: string): Promise<Boolean> => {
  try {
    // Delete User from Database
    await userRepository.delete(id);

    // If user is owner of sports venue then delete them
    const sportsVenues = await sportsVenueRepository.findAll(id);

    if (sportsVenues.length > 0) {
      sportsVenues.forEach((venue) => {
        sportsVenueRepository.delete(venue.getId());
      });

      console.log(`${sportsVenues.length} venues deleted.`);

      // TODO Delete all bookings

      // TODO Delete invites associated to deleted sports venues
    }

    return true;
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};
