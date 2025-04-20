import { UserFilterParams } from '../../domain/dto/user-filter.dto';
import { ClientSession } from 'mongoose';
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

  async updateUserImage(
    id: string, 
    imageData: Partial<User>
  ): Promise<User | undefined> {
    const updatedUser = await UserModel.findByIdAndUpdate(id, imageData, { 
      new: true, 
      runValidators: true 
    });
  
    return updatedUser ? User.fromMongooseDocument(updatedUser) : undefined;
  }  

  async getAll(params?: UserFilterParams): Promise<User[]> {
    const { firstName, userType, page, limit } = params || {};

    const query: any = {};

    if (firstName) {
      query.firstName = { $regex: firstName, $options: 'i' };
    }

    if (userType) {
      query.userType = userType;
    }

    const skip = page && limit ? (page - 1) * limit : 0;

    const queryBuilder = UserModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip);

    if (typeof limit === 'number') {
      queryBuilder.limit(limit);
    }

    const results = await queryBuilder.lean();

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
    console.log(updatedDAta);
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
      { type },
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
