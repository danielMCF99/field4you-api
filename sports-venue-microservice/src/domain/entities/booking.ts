export class Booking {
  public id?: string;
  public ownerId: string;
  public sportsVenueId: string;
  public invitedUserIds: string[];
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(booking: {
    id?: string;
    ownerId: string;
    sportsVenueId: string;
    invitedUserIds: string[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = booking.id;
    this.ownerId = booking.ownerId;
    this.sportsVenueId = booking.sportsVenueId;
    this.invitedUserIds = booking.invitedUserIds;
    this.createdAt = booking.createdAt;
    this.updatedAt = booking.updatedAt;
  }
  getId(): string {
    return this.id ? this.id : 'N/A';
  }

  static fromMongooseDocument(doc: any): Booking {
    return new Booking({
      id: doc._id.toString(),
      ownerId: doc.ownerId.toString(),
      sportsVenueId: doc.sportsVenueId.toString(),
      invitedUserIds: doc.invitedUserIds,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
