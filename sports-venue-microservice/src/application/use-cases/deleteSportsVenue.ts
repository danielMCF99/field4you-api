import { authMiddleware } from '../../app';
import { ISportsVenueRepository } from '../../domain/interfaces/SportsVenueRepository';

export const deleteSportsVenue = async (
  id: string,
  token: string,
  repository: ISportsVenueRepository
): Promise<{ status: number; message: string }> => {
  try {
    const sportsVenue = await repository.findById(id);

    if (!sportsVenue) {
      return {
        status: 404,
        message: 'Sports Venue with given ID not found',
      };
    }

    if (!sportsVenue.ownerId) {
      return { message: 'Sports Venue with given ID not found', status: 404 };
    }

    const authenticated = await authMiddleware.authenticate(
      sportsVenue.ownerId,
      token
    );

    if (!authenticated) {
      return {
        status: 401,
        message: 'Authenticated failed',
      };
    }

    const isDeleted = await repository.delete(id);
    if (!isDeleted) {
      return {
        status: 500,
        message: 'Error when deleting resource',
      };
    }

    return {
      status: 200,
      message: 'Sports Venue Deleted',
    };
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message: 'Something went wrong with sports-venue delete',
    };
  }
};
