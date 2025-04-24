import { Booking } from '../../domain/entities/booking';
import { IBookingRepository } from '../../domain/interfaces/BookingRepository';
import { BookingModel } from '../database/models/booking-Model';

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
    const newBooking = await BookingModel.create([{ ...booking }]);
    return Booking.fromMongooseDocument(newBooking[0]);
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
}
