import { UserFilterParams } from '../../domain/dto/user-filter.dto';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/UserRepository';
import { UserModel } from '../database/models/user.model';

export class MongoUserRepository implements IUserRepository {
  private static instance: MongoUserRepository;

  // Private constructor to prevent direct instantiation
  private constructor() {}

  // Static method to get the single instance
  public static getInstance(): MongoUserRepository {
    if (!MongoUserRepository.instance) {
      MongoUserRepository.instance = new MongoUserRepository();
    }
    return MongoUserRepository.instance;
  }

  async create(user: User): Promise<User> {
    const newUser = await UserModel.create(user);
    return User.fromMongooseDocument(newUser);
  }

  async getAll(params?: UserFilterParams): Promise<User[]> {
    const {
      firstName,
      userType,
      page = 1,
      limit = 10,
    } = params || {};

    const query: any = {};

    if (firstName) {
      query.firstName = { $regex: firstName, $options: 'i' };
    }

    if (userType) {
      query.userType = userType;
    }

    const skip = (page - 1) * limit;

    const results = await UserModel.find(query)
      .skip(skip)
      .limit(limit)
      .lean();

      console.log('Limit:', limit);
console.log('Skip:', skip);


    return results.map(User.fromMongooseDocument);
  }

  async getById(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id);

    if (user === null) {
      return undefined;
    }
    return User.fromMongooseDocument(user);
  }

  async update(
    id: string,
    updatedDAta: Partial<User>
  ): Promise<User | undefined> {
    const updatedUser = await UserModel.findByIdAndUpdate(id, updatedDAta, {
      new: true,
      runValidators: true,
    });

    return updatedUser ? User.fromMongooseDocument(updatedUser) : undefined;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await UserModel.findByIdAndDelete(id);
      return true;
    } catch (error) {
      return false;
    }
  }
}
