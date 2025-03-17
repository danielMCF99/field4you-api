import { SportsVenue } from '../../domain/entities/sports-venue';
import { ISportsVenueRepository } from '../../domain/interfaces/SportsVenueRepository';
import { jwtHelper } from '../../app';
import { publishSportsVenueCreation } from '../../infrastructure/middlewares/rabbitmq.publisher';

export const createSportsVenue = async (
  token: string,
  sportsVenue: SportsVenue,
  repository: ISportsVenueRepository
) => {
  try {
    const ownerId = await jwtHelper.verifyToken(token);
    if (!ownerId) {
      return undefined;
    }
    sportsVenue.ownerId = ownerId;
    const newSportsVenue = await repository.create(sportsVenue);

    // Publish event to RabbitMQ
    await publishSportsVenueCreation({
      authServiceUserId: newSportsVenue.getId(),
      ownerId: newSportsVenue.ownerId,
      location: newSportsVenue.location,
      sportsVenueType: newSportsVenue.sportsVenueType,
      status: newSportsVenue.status,
      sportsVenueName: newSportsVenue.sportsVenueName,
      bookingMinDuration: newSportsVenue.bookingMinDuration,
      bookingMinPrice: newSportsVenue.bookingMinPrice,
      sportsVenuePicture: newSportsVenue.sportsVenuePicture,
      hasParking: newSportsVenue.hasParking,
      hasShower: newSportsVenue.hasShower,
      hasBar: newSportsVenue.hasBar,
    });

    return newSportsVenue;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
