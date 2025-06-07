import { SportsVenueFilterParams } from '../../domain/dtos/sports-venue-filter.dto';
import { SportsVenue, WeeklySchedule } from '../../domain/entities/SportsVenue';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { ISportsVenueRepository } from '../../domain/interfaces/SportsVenueRepository';
import { SportsVenueModel } from '../database/models/sports-venueModel';
import { haversineDistance } from '../utils/haversineDistance';

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
    const updatedSportsVenue = await SportsVenueModel.findByIdAndUpdate(
      id,
      imageData,
      {
        new: true,
        runValidators: true,
      }
    );

    return updatedSportsVenue
      ? SportsVenue.fromMongooseDocument(updatedSportsVenue)
      : undefined;
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

  async deleteImage(id: string, imageId: string): Promise<SportsVenue | null> {
    const deletedSportsVenueImage = await SportsVenueModel.findByIdAndUpdate(
      id,
      { $pull: { sportsVenuePictures: { _id: imageId } } },
      { new: true }
    );

    return deletedSportsVenueImage
      ? SportsVenue.fromMongooseDocument(deletedSportsVenueImage)
      : null;
  }

  async findById(id: string): Promise<SportsVenue | null> {
    const sportsVenue = await SportsVenueModel.findById(id).lean();
    return sportsVenue ? SportsVenue.fromMongooseDocument(sportsVenue) : null;
  }

  async findAll(
    params?: SportsVenueFilterParams
  ): Promise<{ totalPages: number; sportsVenues: SportsVenue[] }> {
    const {
      ownerId,
      sportsVenueName = '',
      page,
      limit,
      status,
      sportsVenueType,
      distance,
      latitude,
      longitude,
      district,
    } = params || {};

    if (
      typeof distance === 'number' &&
      (latitude == null || longitude == null)
    ) {
      throw new BadRequestException(
        'Unable to obtain current location: latitude and longitude are mandatory when distance is provided.'
      );
    }

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

    if (district) {
      query['location.district'] = district;
    }

    const skip = page && limit ? (page - 1) * limit : 0;

    const queryBuilder = SportsVenueModel.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip);

    if (typeof limit === 'number') {
      queryBuilder.limit(limit);
    }

    const results = await queryBuilder.lean();

    let venues = results.map(SportsVenue.fromMongooseDocument);

    if (
      typeof distance === 'number' &&
      typeof latitude === 'number' &&
      typeof longitude === 'number'
    ) {
      venues = venues.filter((venue) => {
        const lat = venue.location?.latitude;
        const lon = venue.location?.longitude;

        if (lat == null || lon == null) {
          return false;
        }

        const dist = haversineDistance(latitude, longitude, lat, lon);
        return dist <= distance;
      });
    }

    const numberOfSportsVenues = await SportsVenueModel.countDocuments(query);
    return {
      totalPages: numberOfSportsVenues,
      sportsVenues: venues,
    };
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
  async updateWeeklySchedule(
    venueId: string,
    weeklySchedule: WeeklySchedule
  ): Promise<SportsVenue | null> {
    console.log('Aqui', venueId, weeklySchedule);
    const updatedVenue = await SportsVenueModel.findByIdAndUpdate(
      venueId,
      { $set: { weeklySchedule } },
      { new: true, runValidators: true }
    );

    return updatedVenue ? SportsVenue.fromMongooseDocument(updatedVenue) : null;
  }
  async getWeeklySchedule(venueId: string): Promise<WeeklySchedule | null> {
    const venue = await SportsVenueModel.findById(venueId, {
      weeklySchedule: 1,
    }).lean();

    return venue?.weeklySchedule || null;
  }
  async getAllDistricts(): Promise<string[]> {
    const districts = await SportsVenueModel.distinct('location.district');
    return districts
      .filter((d): d is string => typeof d === 'string')
      .map((d) => d.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }
}
