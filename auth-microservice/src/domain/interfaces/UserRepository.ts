import { User } from '../entities/User';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | undefined>;
  update(id: string, updatedDAta: Partial<User>): Promise<User | undefined>;
  getById(id: string): Promise<User | undefined>;
  delete(id: string): Promise<boolean>;
}
