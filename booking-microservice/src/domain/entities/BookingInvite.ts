export class BookingInvite {
  public id?: string;
  public bookingId: string;
  public userId: string;
  public status: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(bookingInvite: {
    id?: string;
    bookingId: string;
    userId: string;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = bookingInvite.id;
    this.bookingId = bookingInvite.bookingId;
    this.userId = bookingInvite.userId;
    this.status = bookingInvite.status;
    this.createdAt = bookingInvite.createdAt;
    this.updatedAt = bookingInvite.updatedAt;
  }
  getId(): string {
    return this.id ? this.id : 'N/A';
  }
  getBookingId(): string {
    return this.bookingId ? this.bookingId : 'N/A';
  }

  getUserId(): string {
    return this.userId ? this.userId : 'N/A';
  }

  static fromMongooseDocument(doc: any): BookingInvite {
    return new BookingInvite({
      id: doc._id.toString(),
      bookingId: doc.bookingId,
      userId: doc.userId,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
