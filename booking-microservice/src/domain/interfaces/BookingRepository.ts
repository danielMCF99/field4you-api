import { Booking } from "../entities/Booking";

export interface IBookingRepository {
  create(booking: Booking): Promise<Booking>;
  findById(id: string): Promise<Booking | undefined>;
  findAll(): Promise<Booking[]>;
  delete(id: string): Promise<boolean>;
  update(
    id: string,
    updatedData: Partial<Booking>
  ): Promise<Booking | undefined>;
}
