import mongoose from 'mongoose';
import { BookingInvite } from '../../domain/entities/BookingInvite';
import { IBookingInviteRepository } from '../../domain/interfaces/BookingInviteRepository';
import { BookingInviteModel } from '../database/models/booking-invite.model';
import { BookingInviteFilterParams } from '../../domain/dto/booking-invite-filter.dto';

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

  async create(bookingInvite: BookingInvite): Promise<BookingInvite> {
    const newBookingInvite = await BookingInviteModel.create(bookingInvite);
    return BookingInvite.fromMongooseDocument(newBookingInvite);
  }

  async findAllByBookingId(bookingId: string): Promise<BookingInvite[] | []> {
    throw new Error('Method not implemented.');
  }

  async findAllByUserId(userId: string): Promise<BookingInvite[] | []> {
    throw new Error('Method not implemented.');
  }

  async update(
    bookingId: string,
    userId: string,
    updatedData: Partial<BookingInvite>
  ): Promise<BookingInvite | undefined> {
    throw new Error('Method not implemented.');
  }

  async insertMany(
    bookingInvites: BookingInvite[],
    session?: mongoose.ClientSession
  ): Promise<BookingInvite[]> {
    const createdDocs = await BookingInviteModel.insertMany(
      bookingInvites,
      session ? { session } : {}
    );
    console.log(createdDocs);
    return createdDocs.map((doc) => BookingInvite.fromMongooseDocument(doc));
  }

  async findAll(params?: BookingInviteFilterParams): Promise<BookingInvite[]> {
    const {
      bookingId = '',
      userId = '',
      status = '',
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

    if (status) {
      query.status = status;
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
}
