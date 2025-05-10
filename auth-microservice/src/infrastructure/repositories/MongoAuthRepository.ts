import { Auth } from '../../domain/entities/Auth';
import { IAuthRepository } from '../../domain/interfaces/AuthRepository';
import { AuthModel } from '../database/models/auth.model';

export class MongoAuthRepository implements IAuthRepository {
  private static instance: MongoAuthRepository;

  // Private constructor to prevent direct instantiation
  private constructor() {}

  // Static method to get the single instance
  public static getInstance(): MongoAuthRepository {
    if (!MongoAuthRepository.instance) {
      MongoAuthRepository.instance = new MongoAuthRepository();
    }
    return MongoAuthRepository.instance;
  }

  async create(auth: Auth): Promise<Auth> {
    const newAuth = await AuthModel.create(auth);
    return Auth.fromMongooseDocument(newAuth);
  }

  async findByEmail(email: string): Promise<Auth | undefined> {
    const auth = await AuthModel.findOne({ email });
    return auth ? Auth.fromMongooseDocument(auth) : undefined;
  }

  async update(
    id: string,
    updatedDAta: Partial<Auth>
  ): Promise<Auth | undefined> {
    const updatedAuth = await AuthModel.findByIdAndUpdate(id, updatedDAta, {
      new: true,
      runValidators: true,
    });
    return updatedAuth ? Auth.fromMongooseDocument(updatedAuth) : undefined;
  }

  async getById(id: string): Promise<Auth | undefined> {
    const auth = await AuthModel.findById(id);

    if (auth === null) {
      return undefined;
    }
    return Auth.fromMongooseDocument(auth);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await AuthModel.findByIdAndDelete(id);
      return true;
    } catch (error) {
      return false;
    }
  }
}
