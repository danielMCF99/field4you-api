import { userRepository } from '../../../app';
import { User } from '../../../domain/entities/User';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { getCoordinatesFromAddress } from '../../../infrastructure/utils/getCoordinatesFromAddress';

export const createUser = async (user: any): Promise<User | undefined> => {
  try {
    const { address, city, district } = user.location;

    try {
      const coords = await getCoordinatesFromAddress(address, city, district);
      user.location.latitude = coords.latitude;
      user.location.longitude = coords.longitude;
    } catch (err) {
      console.log(err);
      console.log('Could not fetch coordinates:');
    }

    const userId = user.userId;
    user._id = userId.toString();
    const newUser = await userRepository.create(user);
    return newUser;
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException('Error creating user using queue');
  }
};
