import mongoose, { ClientSession, Types } from 'mongoose';
import {
  SportsVenue,
  SportsVenueStatus,
} from '../../domain/entities/SportsVenue';
import { ISportsVenueRepository } from '../../domain/interfaces/SportsVenueRepository';
import { SportsVenueModel } from '../database/models/sports-venue.model';

export class MongoSportsVenueRepository implements ISportsVenueRepository {
  private static instance: MongoSportsVenueRepository;

  // Private constructor to prevent direct instantiation
  private constructor() {}

  // Static method to get the single instance
  public static getInstance(): MongoSportsVenueRepository {
    if (!MongoSportsVenueRepository.instance) {
      MongoSportsVenueRepository.instance = new MongoSportsVenueRepository();
    }
    return MongoSportsVenueRepository.instance;
  }

  async create(sportsVenue: SportsVenue): Promise<SportsVenue> {
    const newSportsVenue = await SportsVenueModel.create(sportsVenue);
    return SportsVenue.fromMongooseDocument(newSportsVenue);
  }

  async update(
    id: string,
    updatedData: Partial<SportsVenue>
  ): Promise<SportsVenue | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('ID inválido:', id);
      return null;
    }

    const dataToUpdate = (updatedData as any).updatedData || updatedData;

    const updatedSportsVenue = await SportsVenueModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      { $set: dataToUpdate },
      { new: true, runValidators: true }
    );

    return updatedSportsVenue
      ? SportsVenue.fromMongooseDocument(updatedSportsVenue)
      : null;
  }

  async delete(id: string): Promise<SportsVenue | null> {
    const deletedSportsVenue = await SportsVenueModel.findByIdAndDelete(id);
    return deletedSportsVenue
      ? SportsVenue.fromMongooseDocument(deletedSportsVenue)
      : null;
  }

  async findById(id: string): Promise<SportsVenue | null> {
    const sportsVenue = await SportsVenueModel.findById(id).lean();
    return sportsVenue ? SportsVenue.fromMongooseDocument(sportsVenue) : null;
  }

  async findAll(ownerId?: string): Promise<SportsVenue[]> {
    const query: any = {};

    if (ownerId) {
      query.ownerId = ownerId;
    }

    const queryBuilder = SportsVenueModel.find(query).sort({ createdAt: -1 });

    const results = await queryBuilder.lean();

    return results.map(SportsVenue.fromMongooseDocument);
  }

  async deleteManyByOwnerId(ownerId: string): Promise<number> {
    const result = await SportsVenueModel.deleteMany({ ownerId: ownerId });
    return result.deletedCount;
  }

  async bulkDeleteByIds(
    venueIds: string[],
    session?: ClientSession
  ): Promise<{ deletedCount?: number }> {
    return SportsVenueModel.deleteMany(
      {
        _id: { $in: venueIds.map((id) => new Types.ObjectId(id)) },
      },
      { session: session }
    ).exec();
  }

  async countSportsVenues(): Promise<number> {
    return SportsVenueModel.countDocuments({
      status: SportsVenueStatus.active,
    });
  }
}
