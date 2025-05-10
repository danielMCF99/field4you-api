import { Auth } from '../entities/Auth';

export interface IAuthRepository {
  create(auth: Auth): Promise<Auth>;
  findByEmail(email: string): Promise<Auth | undefined>;
  update(id: string, updatedDAta: Partial<Auth>): Promise<Auth | undefined>;
  getById(id: string): Promise<Auth | undefined>;
  delete(id: string): Promise<boolean>;
}
