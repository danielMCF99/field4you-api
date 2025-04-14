import { userRepository } from '../../app';
import { User } from '../../domain/entities/User';
import { UserFilterParams } from '../../domain/dto/user-filter.dto';

export const getAll = async (
  params: UserFilterParams
): Promise<User[]> => {
  return await userRepository.getAll(params);
};
