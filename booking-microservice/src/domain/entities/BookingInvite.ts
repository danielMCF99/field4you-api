export enum BookingInviteStatus {
  accepted = 'Accepted',
  rejected = 'Rejected',
  pending = 'Pending',
}

export class BookingInvite {
  public id?: string;
  public bookingId: string;
  public userId: string;
  public sportsVenueId: string;
  public sportsVenueName: string;
  public bookingStartDate: Date;
  public bookingEndDate: Date;
  public status: BookingInviteStatus;
  public comments?: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(bookingInvite: {
    id?: string;
    bookingId: string;
    userId: string;
    sportsVenueId: string;
    sportsVenueName: string;
    bookingStartDate: Date;
    bookingEndDate: Date;
    status: BookingInviteStatus;
    comments?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = bookingInvite.id;
    this.bookingId = bookingInvite.bookingId;
    this.userId = bookingInvite.userId;
    this.sportsVenueId = bookingInvite.sportsVenueId;
    this.sportsVenueName = bookingInvite.sportsVenueName;
    this.bookingStartDate = bookingInvite.bookingStartDate;
    this.bookingEndDate = bookingInvite.bookingEndDate;
    this.status = bookingInvite.status;
    this.comments = bookingInvite.comments;
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
      sportsVenueName: doc.sportsVenueName,
      bookingStartDate: doc.bookingStartDate,
      bookingEndDate: doc.bookingEndDate,
      status: doc.status,
      comments: doc.comments,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
