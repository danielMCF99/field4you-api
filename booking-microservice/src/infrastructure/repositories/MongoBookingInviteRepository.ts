import mongoose, { ClientSession, Types } from 'mongoose';
import { BookingInviteFilterParams } from '../../domain/dtos/booking-invite-filter.dto';
import {
  BookingInvite,
  BookingInviteStatus,
} from '../../domain/entities/BookingInvite';
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

  async create(bookingInvite: BookingInvite): Promise<BookingInvite> {
    const newBookingInvite = await BookingInviteModel.create(bookingInvite);
    return BookingInvite.fromMongooseDocument(newBookingInvite);
  }

  async update(
    bookingId: string,
    userId: string,
    updatedData: Partial<BookingInvite>
  ): Promise<BookingInvite | undefined> {
    const bookingInvite = await BookingInviteModel.findOneAndUpdate(
      {
        userId: userId,
        bookingId: bookingId,
      },
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!bookingInvite) {
      return undefined;
    }
    return BookingInvite.fromMongooseDocument(bookingInvite);
  }

  async insertMany(
    bookingInvites: BookingInvite[],
    session?: mongoose.ClientSession
  ): Promise<BookingInvite[]> {
    const createdDocs = await BookingInviteModel.insertMany(
      bookingInvites,
      session ? { session } : {}
    );
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

  async existsByBookingIdAndUserId(
    bookingId: string,
    userId: string
  ): Promise<Boolean> {
    const bookingInvite = await BookingInviteModel.findOne({
      bookingId,
      userId,
    }).exec();

    if (!bookingInvite) {
      return false;
    }

    return true;
  }

  async findById(id: string): Promise<BookingInvite | undefined> {
    const bookingInvite = await BookingInviteModel.findById(id);
    if (!bookingInvite) {
      return undefined;
    }
    return BookingInvite.fromMongooseDocument(bookingInvite);
  }

  async updateStatus(
    id: string,
    status: string,
    comments?: string
  ): Promise<BookingInvite | undefined> {
    const updatedBookingInvite = await BookingInviteModel.findByIdAndUpdate(
      id,
      { status: status, comments: comments ? comments : null },
      {
        new: true,
        runValidators: true,
      }
    );

    return updatedBookingInvite
      ? BookingInvite.fromMongooseDocument(updatedBookingInvite)
      : undefined;
  }

  async bulkUpdateStatusByBookingIds(
    bookingIds: string[],
    status: BookingInviteStatus,
    reason: string,
    session?: ClientSession
  ): Promise<{ modifiedCount: number }> {
    return BookingInviteModel.updateMany(
      {
        bookingId: { $in: bookingIds.map((id) => new Types.ObjectId(id)) },
      },
      {
        $set: {
          status,
          comments: reason,
        },
      },
      {
        session: session,
      }
    ).exec();
  }

  async bulkUpdateStatusByUserId(
    userId: string,
    status: BookingInviteStatus,
    reason: string,
    session?: ClientSession
  ): Promise<{ modifiedCount: number }> {
    return BookingInviteModel.updateMany(
      {
        userId: new Types.ObjectId(userId),
      },
      {
        $set: {
          status,
          cancelReason: reason,
        },
      },
      {
        session: session,
      }
    ).exec();
  }

  async bulkUpdateStatusByIds(
    bookingInvitesIds: string[],
    status: BookingInviteStatus,
    reason: string,
    session?: ClientSession
  ): Promise<{ modifiedCount: number }> {
    return BookingInviteModel.updateMany(
      {
        _id: {
          $in: bookingInvitesIds.map((id) => new Types.ObjectId(id)),
        },
      },
      {
        $set: {
          status,
          comments: reason,
        },
      },
      {
        session: session,
      }
    ).exec();
  }

  async findAcceptedFutureByUserId(
    userId: string,
    fromDate: Date,
    includePast: boolean
  ): Promise<BookingInvite[]> {
    const query = {
      userId,
      status: BookingInviteStatus.accepted,
      ...(includePast ? {} : { bookingStartDate: { $gte: fromDate } }),
    };
    const invites = await BookingInviteModel.find(query).lean();
    return invites.map(BookingInvite.fromMongooseDocument);
  }

  async deleteByBookingIdAndUserId(
    bookingId: string,
    userId: string,
    session?: ClientSession
  ): Promise<boolean> {
    const result = await BookingInviteModel.deleteOne(
      {
        bookingId: bookingId,
        userId: userId,
      },
      session ? { session } : {}
    );
    return result.deletedCount > 0;
  }

  async bulkDeleteByBookingIdAndUserIds(
    bookingId: string,
    userIds: string[],
    session?: ClientSession
  ): Promise<{ deletedCount: number }> {
    const result = await BookingInviteModel.deleteMany(
      {
        bookingId: bookingId,
        userId: { $in: userIds },
      },
      session ? { session } : {}
    );
    return { deletedCount: result.deletedCount || 0 };
  }
}
