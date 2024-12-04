import { User } from '../entities/User';

export interface IUserRepository {
  create(user: User): Promise<User>;
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User | undefined>;
  update(id: string, updatedData: Partial<User>): Promise<User | undefined>;
  delete(id: string): Promise<boolean>;
}
