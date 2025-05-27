import { ClientSession } from 'mongoose';
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

  private escapeRegex(text: string): string {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  async create(user: User): Promise<User> {
    const newUser = await UserModel.create(user);
    return User.fromMongooseDocument(newUser);
  }

  async updateUserImage(
    id: string,
    imageData: Partial<User>
  ): Promise<User | undefined> {
    const updatedUser = await UserModel.findByIdAndUpdate(id, imageData, {
      new: true,
      runValidators: true,
    });

    return updatedUser ? User.fromMongooseDocument(updatedUser) : undefined;
  }

  async getAll(
    params?: UserFilterParams
  ): Promise<{ totalPages: number; users: User[] }> {
    const { firstName, lastName, userType, email, page, limit } = params || {};

    const query: any = {};

    if (firstName) {
      query.firstName = { $regex: firstName, $options: 'i' };
    }

    if (lastName) {
      query.lastName = { $regex: lastName, $options: 'i' };
    }

    if (userType) {
      query.userType = userType;
    }

    if (email) {
      query.email = { $regex: this.escapeRegex(email), $options: 'i' };
    }

    const skip = page && limit ? (page - 1) * limit : 0;

    const queryBuilder = UserModel.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip);

    if (typeof limit === 'number') {
      queryBuilder.limit(limit);
    }

    const results = await queryBuilder.lean();
    const numberOfUsers = await UserModel.countDocuments(query);

    return {
      totalPages: Math.ceil(numberOfUsers / (limit ? limit : 10)),
      users: results.map(User.fromMongooseDocument),
    };
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

  async updateType(
    id: string,
    type: string,
    session?: ClientSession
  ): Promise<User | undefined> {
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { userType: type },
      {
        new: true,
        runValidators: true,
        session,
      }
    );

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
