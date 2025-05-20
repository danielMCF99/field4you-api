import { User } from '../entities/User';

export interface IUserRepository {
  create(user: User): Promise<User>;
  getById(id: string): Promise<User | undefined>;
  getAll(): Promise<User[]>;
  update(id: string, updatedDAta: Partial<User>): Promise<User | undefined>;
  delete(id: string): Promise<boolean>;
  countUsersByTypeUser(): Promise<number>;
  countUsersByTypeOwner(): Promise<number>;
}
