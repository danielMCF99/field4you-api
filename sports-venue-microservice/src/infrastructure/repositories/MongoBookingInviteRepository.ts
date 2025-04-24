import { BookingInviteFilterParams } from '../../domain/dtos/booking-invite-filter.dto';
import { BookingInvite } from '../../domain/entities/BookingInvite';
import { IBookingInviteRepository } from '../../domain/interfaces/BookingInviteRepository';
import { BookingInviteModel } from '../database/models/booking-invite.model';

export class MongoBookingInviteRepository implements IBookingInviteRepository {
  private static instance: MongoBookingInviteRepository;

  // Private constructor to prevent direct instantiation
  private constructor() {}

  public static getInstance(): MongoBookingInviteRepository {
    if (!MongoBookingInviteRepository.instance) {
      MongoBookingInviteRepository.instance =
        new MongoBookingInviteRepository();
    }
    return MongoBookingInviteRepository.instance;
  }

  async insertMany(bookingInvites: BookingInvite[]): Promise<BookingInvite[]> {
    const createdDocs = await BookingInviteModel.insertMany(bookingInvites);
    return createdDocs.map((doc) => BookingInvite.fromMongooseDocument(doc));
  }

  async findAll(params?: BookingInviteFilterParams): Promise<BookingInvite[]> {
    const {
      bookingId = '',
      userId = '',
      sportsVenueId = '',
      page,
      limit,
    } = params || {};

    const query: any = {};

    if (bookingId) {
      query.bookingId = bookingId;
    }

    if (userId) {
      query.userId = userId;
    }

    if (sportsVenueId) {
      query.sportsVenueId = sportsVenueId;
    }

    const skip = page && limit ? (page - 1) * limit : 0;

    const queryBuilder = BookingInviteModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip);

    if (typeof limit === 'number') {
      queryBuilder.limit(limit);
    }

    const results = await queryBuilder.lean();

    return results.map(BookingInvite.fromMongooseDocument);
  }

  async existsBySportsVenueIdAndUserId(
    sportsVenueId: string,
    userId: string
  ): Promise<Boolean> {
    const bookingInvite = await BookingInviteModel.findOne({
      sportsVenueId,
      userId,
    }).exec();

    if (!bookingInvite) {
      return false;
    }

    return true;
  }
}
