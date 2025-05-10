import { LoginHistory } from '../../domain/entities/LoginHistory';
import { ILoginHistoryRepository } from '../../domain/interfaces/LoginHistoryRepository';
import { LoginHistoryModel } from '../database/models/login-history.model';

export class MongoLoginHistoryRepository implements ILoginHistoryRepository {
  private static instance: MongoLoginHistoryRepository;

  // Private constructor to prevent direct instantiation
  private constructor() {}

  // Static method to get the single instance
  public static getInstance(): MongoLoginHistoryRepository {
    if (!MongoLoginHistoryRepository.instance) {
      MongoLoginHistoryRepository.instance = new MongoLoginHistoryRepository();
    }
    return MongoLoginHistoryRepository.instance;
  }

  async create(loginHistory: LoginHistory): Promise<LoginHistory> {
    const newLoginHistory = await LoginHistoryModel.create(loginHistory);
    return LoginHistory.fromMongooseDocument(newLoginHistory);
  }
}
