export enum BookingType {
  regular = 'regular',
  event = 'event',
}

export enum BookingStatus {
  active = 'active',
  cancelled = 'cancelled',
  done = 'done',
}

export class Booking {
  public id?: string;
  public ownerId?: string;
  public sportsVenueId: string;
  public bookingType: BookingType;
  public status: BookingStatus;
  public title: string;
  public bookingStartDate: Date;
  public bookingEndDate: Date;
  public isPublic: boolean;
  public invitedUsersIds: string[];
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(booking: {
    id?: string;
    ownerId?: string;
    sportsVenueId: string;
    bookingType: BookingType;
    status: BookingStatus;
    title: string;
    bookingStartDate: Date;
    bookingEndDate: Date;
    isPublic: boolean;
    invitedUsersIds?: string[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = booking.id;
    this.ownerId = booking.ownerId;
    this.sportsVenueId = booking.sportsVenueId;
    this.bookingType = booking.bookingType;
    this.status = booking.status;
    this.title = booking.title;
    this.bookingStartDate = booking.bookingStartDate;
    this.bookingEndDate = booking.bookingEndDate;
    this.isPublic = booking.isPublic;
    this.invitedUsersIds = booking.invitedUsersIds || [];
    this.createdAt = booking.createdAt;
    this.updatedAt = booking.updatedAt;
  }
  getId(): string {
    return this.id ? this.id : 'N/A';
  }
  getOwnerId(): string {
    return this.ownerId ? this.ownerId : 'N/A';
  }

  static fromMongooseDocument(doc: any): Booking {
    return new Booking({
      id: doc._id.toString(),
      ownerId: doc.ownerId,
      sportsVenueId: doc.sportsVenueId,
      bookingType: doc.bookingType,
      status: doc.status,
      title: doc.title,
      bookingStartDate: doc.bookingStartDate,
      bookingEndDate: doc.bookingEndDate,
      isPublic: doc.isPublic,
      invitedUsersIds: doc.invitedUsersIds,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
