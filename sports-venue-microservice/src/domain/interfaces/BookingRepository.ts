import { Booking } from '../entities/booking';

export interface IBookingRepository {
  create(booking: Booking): Promise<Booking>;

  update(
    id: string,
    updatedData: Partial<Booking>
  ): Promise<Booking | undefined>;
}
