import { User } from '../entities/User';

export interface AllUsersResponse {
  totalPages: number;
  users: User[];
}
