import { Booking } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../domain/interfaces/BookingRepository";
import { BookingModel } from "../database/models/booking.model";

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
    if (!booking) {
      return undefined;
    }
    return Booking.fromMongooseDocument(booking);
  }

  async findAll(): Promise<Booking[]> {
    const allBookings = await BookingModel.find();
    return allBookings.map((booking) => Booking.fromMongooseDocument(booking));
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
}
