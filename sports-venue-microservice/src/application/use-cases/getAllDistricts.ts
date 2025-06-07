import { sportsVenueRepository } from '../../app';

export const getAllDistricts = async (): Promise<string[]> => {
  return await sportsVenueRepository.getAllDistricts();
};
