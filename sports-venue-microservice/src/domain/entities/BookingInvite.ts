export class BookingInvite {
  public id?: string;
  public bookingId: string;
  public userId: string;
  public sportsVenueId: string;
  public bookingStartDate: Date;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(bookingInvite: {
    id?: string;
    bookingId: string;
    userId: string;
    sportsVenueId: string;
    bookingStartDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = bookingInvite.id;
    this.bookingId = bookingInvite.bookingId;
    this.userId = bookingInvite.userId;
    this.sportsVenueId = bookingInvite.sportsVenueId;
    this.bookingStartDate = bookingInvite.bookingStartDate;
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
      sportsVenueId: doc.sportsVenueId,
      bookingStartDate: doc.bookingStartDate,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
