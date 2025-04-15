import { Booking } from '../../domain/entities/Booking';
import { IBookingRepository } from '../../domain/interfaces/BookingRepository';
import { BookingModel } from '../database/models/booking.model';
import { BookingFilterParams } from '../../domain/dto/booking-filter.dto';

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
  async create(booking: Booking): Promise<Booking> {
    const newBooking = await BookingModel.create(booking);
    return Booking.fromMongooseDocument(newBooking);
  }

  async findById(id: string): Promise<Booking | undefined> {
    const booking = await BookingModel.findById(id);
    console.log(booking);
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

  async findAll(params?: BookingFilterParams): Promise<Booking[]> {
    const {
      title = '',
      status = '',
      bookingType = '',
      bookingStartDate,
      bookingEndDate,
      page = 1,
      limit = 10
    } = params || {};
  
    const query: any = {};
  
    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }
  
    if (status) {
      query.status = status;
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
  
    const skip = (page - 1) * limit;
  
    const results = await BookingModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  
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
    updatedData: Partial<Booking>
  ): Promise<Booking | undefined> {
    const updatedBooking = await BookingModel.findByIdAndUpdate(
      id,
      updatedData,
      {
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
}
