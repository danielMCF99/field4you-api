import { SportsVenueFilterParams } from '../../domain/dtos/sports-venue-filter.dto';
import { SportsVenue } from '../../domain/entities/sports-venue';
import { ISportsVenueRepository } from '../../domain/interfaces/SportsVenueRepository';
import { SportsVenueModel } from '../database/models/sports-venueModel';

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

  async updateSportsVenueImage(
    id: string,
    imageData: Partial<SportsVenue>
  ): Promise<SportsVenue | undefined> {
    const updatedSportsVenue = await SportsVenueModel.findByIdAndUpdate(id, imageData, {
      new: true,
      runValidators: true,
    });
    
    return updatedSportsVenue ? SportsVenue.fromMongooseDocument(updatedSportsVenue) : undefined;
  }

  async update(
    id: string,
    updatedData: Partial<SportsVenue>
  ): Promise<SportsVenue | null> {
    const updatedSportsVenue = await SportsVenueModel.findByIdAndUpdate(
      id,
      updatedData,
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

  async findAll(params?: SportsVenueFilterParams): Promise<SportsVenue[]> {
    const {
      ownerId,
      sportsVenueName = '',
      page,
      limit,
      status,
      sportsVenueType,
    } = params || {};

    const query: any = {};

    if (ownerId) {
      query.ownerId = ownerId;
    }

    if (sportsVenueName) {
      query.sportsVenueName = { $regex: sportsVenueName, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    if (sportsVenueType) {
      query.sportsVenueType = sportsVenueType;
    }

    const skip = page && limit ? (page - 1) * limit : 0;

    const queryBuilder = SportsVenueModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip);

    if (typeof limit === 'number') {
      queryBuilder.limit(limit);
    }

    const results = await queryBuilder.lean();

    return results.map(SportsVenue.fromMongooseDocument);
  }

  async deleteManyByOwnerId(ownerId: string): Promise<number> {
    const result = await SportsVenueModel.deleteMany({ ownerId: ownerId });
    return result.deletedCount;
  }

  async findByOwnerIdAndUpdate(
    ownerId: string,
    updatedData: Partial<SportsVenue>
  ): Promise<number> {
    const updatedVenues = await SportsVenueModel.updateMany(
      { ownerId },
      { $set: updatedData }
    );

    return updatedVenues.modifiedCount;
  }
}
