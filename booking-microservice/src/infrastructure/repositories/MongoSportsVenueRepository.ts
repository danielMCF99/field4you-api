import mongoose from "mongoose";
import { SportsVenue } from "../../domain/entities/SportsVenue";
import { ISportsVenueRepository } from "../../domain/interfaces/SportsVenueRepository";
import { SportsVenueModel } from "../database/models/sports-venue.model";

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
      console.error("ID inválido:", id);
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

  async findAll(): Promise<SportsVenue[]> {
    const allSportsVenue = await SportsVenueModel.find();
    return allSportsVenue.map((sportsVenue) =>
      SportsVenue.fromMongooseDocument(sportsVenue)
    );
  }
}
