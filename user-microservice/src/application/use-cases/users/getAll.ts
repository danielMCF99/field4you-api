import { userRepository } from '../../../app';
import { AllUsersResponse } from '../../../domain/dto/all-user.dto';
import { UserFilterParams } from '../../../domain/dto/user-filter.dto';

export const getAll = async (
  query: UserFilterParams
): Promise<AllUsersResponse> => {
  const filters: UserFilterParams = {
    firstName: query.firstName?.toString(),
    userType: query.userType?.toString(),
    email: query.email?.toString(),
    limit: query.limit ? parseInt(query.limit.toString()) : 10,
    page: query.page ? parseInt(query.page.toString()) : 1,
  };

  const users = await userRepository.getAll(filters);
  return {
    users: users,
  };
};
