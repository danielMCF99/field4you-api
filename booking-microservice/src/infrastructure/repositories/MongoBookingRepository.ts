import mongoose, { ClientSession, Types } from 'mongoose';
import { BookingFilterParams } from '../../domain/dtos/booking-filter.dto';
import {
  Booking,
  BookingStatus,
  BookingType,
} from '../../domain/entities/Booking';
import { IBookingRepository } from '../../domain/interfaces/BookingRepository';
import { BookingModel } from '../database/models/booking.model';

export class MongoBookingRepository implements IBookingRepository {
  private static instance: MongoBookingRepository;

  // Private constructor to prevent direct instantiation
  private constructor() {}

  public static getInstance(): MongoBookingRepository {
    if (!MongoBookingRepository.instance) {
      MongoBookingRepository.instance = new MongoBookingRepository();
    }
    return MongoBookingRepository.instance;
  }
  async create(
    booking: Booking,
    session: mongoose.ClientSession
  ): Promise<Booking> {
    const newBooking = await BookingModel.create([{ ...booking }], { session });
    return Booking.fromMongooseDocument(newBooking[0]);
  }

  async findById(id: string): Promise<Booking | undefined> {
    const booking = await BookingModel.findById(id);
    if (!booking) {
      return undefined;
    }
    return Booking.fromMongooseDocument(booking);
  }

  async findByIdAndOwnerId(
    id: string,
    ownerId: string
  ): Promise<Booking | undefined> {
    const booking = await BookingModel.findOne({ _id: id, ownerId }).exec();
    if (!booking) {
      return undefined;
    }
    return Booking.fromMongooseDocument(booking);
  }

  async findAll(
    params?: BookingFilterParams,
    allowedStatuses?: BookingStatus[]
  ): Promise<Booking[]> {
    const {
      title = '',
      status = '',
      bookingType = '',
      bookingStartDate,
      bookingEndDate,
      sportsVenueId,
      page,
      limit,
    } = params || {};

    const query: any = {};

    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }

    if (status) {
      query.status = status;
    } else if (allowedStatuses) {
      query.status = { $in: allowedStatuses };
    }

    if (Array.isArray(sportsVenueId)) {
      query.sportsVenueId = { $in: sportsVenueId };
    } else if (sportsVenueId) {
      query.sportsVenueId = sportsVenueId;
    }

    if (bookingType) {
      query.bookingType = bookingType;
    }

    if (bookingStartDate && bookingEndDate) {
      query.bookingStartDate = { $gte: bookingStartDate };
      query.bookingEndDate = { $lte: bookingEndDate };
    } else if (bookingStartDate) {
      query.bookingStartDate = { $gte: bookingStartDate };
    } else if (bookingEndDate) {
      query.bookingEndDate = { $lte: bookingEndDate };
    }

    const skip = page && limit ? (page - 1) * limit : 0;

    const queryBuilder = BookingModel.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip);

    if (typeof limit === 'number') {
      queryBuilder.limit(limit);
    }

    const results = await queryBuilder.lean();

    return results.map(Booking.fromMongooseDocument);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await BookingModel.findByIdAndDelete(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  async update(
    id: string,
    updatedData: Partial<Booking>,
    session?: mongoose.ClientSession
  ): Promise<Booking | undefined> {
    const updatedBooking = await BookingModel.findByIdAndUpdate(
      id,
      updatedData,
      {
        session: session ? session : null,
        new: true,
        runValidators: true,
      }
    );
    if (!updatedBooking) {
      return undefined;
    }
    return Booking.fromMongooseDocument(updatedBooking);
  }

  async updateStatus(id: string, status: string): Promise<Booking | undefined> {
    const updatedBooking = await BookingModel.findByIdAndUpdate(
      id,
      { status: status },
      {
        new: true,
        runValidators: true,
      }
    );

    return updatedBooking
      ? Booking.fromMongooseDocument(updatedBooking)
      : undefined;
  }

  async findConflictingBookings(
    sportsVenueId: string,
    bookingStartDate: Date,
    bookingEndDate: Date,
    idToExclude?: string
  ): Promise<Booking[]> {
    const query: Record<string, unknown> = {
      sportsVenueId,
      status: BookingStatus.active,
      $or: [
        {
          bookingStartDate: { $lt: bookingEndDate },
          bookingEndDate: { $gt: bookingStartDate },
        },
      ],
    };

    if (idToExclude) {
      query._id = { $ne: idToExclude };
    }

    const conflictingBookings = await BookingModel.find(query);
    return conflictingBookings.map((doc) => Booking.fromMongooseDocument(doc));
  }

  async findAllActiveByVenueIds(venueIds: string[]): Promise<Booking[]> {
    const results = await BookingModel.find({
      sportsVenueId: { $in: venueIds.map((id) => new Types.ObjectId(id)) },
      status: BookingStatus.active,
      bookingStartDate: { $gte: new Date() },
    }).exec();

    return results.map(Booking.fromMongooseDocument);
  }

  async bulkStatusUpdateByIds(
    bookingIds: string[],
    session?: ClientSession
  ): Promise<{ modifiedCount?: number }> {
    return BookingModel.updateMany(
      {
        _id: { $in: bookingIds.map((id) => new Types.ObjectId(id)) },
      },
      {
        $set: {
          status: BookingStatus.cancelled,
        },
      },
      {
        session: session,
      }
    ).exec();
  }

  async cancelByUserId(
    userId: string,
    session?: ClientSession
  ): Promise<{ modifiedCount: number }> {
    return BookingModel.updateMany(
      {
        ownerId: new Types.ObjectId(userId),
        status: BookingStatus.active,
        bookingStartDate: { $gte: new Date() },
      },
      {
        $set: {
          status: BookingStatus.cancelled,
        },
      },
      {
        session: session,
      }
    ).exec();
  }

  async countBookings(): Promise<number> {
    return BookingModel.countDocuments({
      status: { $in: [BookingStatus.confirmed, BookingStatus.done] },
    });
  }

  async countBookingsByMonthAndType(): Promise<
    { month: string; regular: number; event: number }[]
  > {
    const currentYear = new Date().getFullYear();
    const results = await BookingModel.aggregate([
      {
        $match: {
          status: { $in: [BookingStatus.confirmed, BookingStatus.done] },
          bookingStartDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $project: {
          month: { $month: '$bookingStartDate' },
          bookingType: 1,
        },
      },
      {
        $group: {
          _id: { month: '$month', type: '$bookingType' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Inicializar com todos os meses
    const monthNames = [
      '',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mai',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const initialData: Record<number, { regular: number; event: number }> = {};
    for (let i = 1; i <= 12; i++) {
      initialData[i] = { regular: 0, event: 0 };
    }

    // Preencher com os dados reais
    for (const item of results) {
      const month = item._id.month;
      const type = item._id.type;
      const count = item.count;

      if (type === BookingType.regular) {
        initialData[month].regular = count;
      } else if (type === BookingType.event) {
        initialData[month].event = count;
      }
    }

    // Mapear para o formato de resposta esperado
    return Object.entries(initialData).map(([monthNumber, data]) => ({
      month: monthNames[parseInt(monthNumber)],
      regular: data.regular,
      event: data.event,
    }));
  }
  async getBookedTimeSlotsForDay(
    sportsVenueId: string,
    date: Date
  ): Promise<{ startTime: string; endTime: string }[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await BookingModel.find({
      sportsVenueId,
      bookingStartDate: { $lt: endOfDay },
      bookingEndDate: { $gt: startOfDay },
      status: { $ne: 'Cancelled' },
    }).lean();

    return bookings.map((booking) => ({
      startTime: booking.bookingStartDate.toISOString(),
      endTime: booking.bookingEndDate.toISOString(),
    }));
  }
}
