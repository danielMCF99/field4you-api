import { BookingInvite } from '../../domain/entities/BookingInvite';
import { IBookingInviteRepository } from '../../domain/interfaces/BookingInviteRepository';

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

  create(bookingInvite: BookingInvite): Promise<BookingInvite> {
    throw new Error('Method not implemented.');
  }
  findAllByBookingId(bookingId: string): Promise<BookingInvite[] | []> {
    throw new Error('Method not implemented.');
  }
  findAllByUserId(userId: string): Promise<BookingInvite[] | []> {
    throw new Error('Method not implemented.');
  }
  update(
    bookingId: string,
    userId: string,
    updatedData: Partial<BookingInvite>
  ): Promise<BookingInvite | undefined> {
    throw new Error('Method not implemented.');
  }
}
