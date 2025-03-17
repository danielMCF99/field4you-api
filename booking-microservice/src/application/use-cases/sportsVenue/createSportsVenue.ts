import { SportsVenue } from '../../../domain/entities/SportsVenue';
import { sportsVenueRepository } from '../../../app';

export const createSportsVenue = async (
  sportsVenue: any
): Promise<SportsVenue | undefined> => {
  // Perform validations
  const {
    authServiceUserId,
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
    const newSportsVenue = await sportsVenueRepository.create(sportsVenue);
    return newSportsVenue;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
