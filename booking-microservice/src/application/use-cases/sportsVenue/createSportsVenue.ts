import { SportsVenue } from '../../../domain/entities/SportsVenue';
import { sportsVenueRepository } from '../../../app';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';

export const createSportsVenue = async (
  sportsVenue: any
): Promise<SportsVenue | undefined> => {
  // Perform validations
  const {
    sportsVenueId,
    ownerId,
    location,
    sportsVenueType,
    status,
    sportsVenueName,
    bookingMinDuration,
    bookingMinPrice,
    sportsVenuePicture,
    hasParking,
    hasShower,
    hasBar,
  } = sportsVenue;
  try {
    sportsVenue._id = sportsVenue.sportsVenueId.toString();
    const newSportsVenue = await sportsVenueRepository.create(sportsVenue);
    return newSportsVenue;
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};
