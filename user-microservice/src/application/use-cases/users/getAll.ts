import { UserFilterParams } from '../../../domain/dto/user-filter.dto';
import { userRepository } from '../../../app';
import { User } from '../../../domain/entities/User';

export const getAll = async (query: UserFilterParams): Promise<User[]> => {
  const filters: UserFilterParams = {
    firstName: query.firstName?.toString(),
    userType: query.userType?.toString(),
    email: query.email?.toString(),
    limit: query.limit ? parseInt(query.toString()) : 10,
    page: query.page ? parseInt(query.toString()) : 1,
  };

  return await userRepository.getAll(filters);
};
