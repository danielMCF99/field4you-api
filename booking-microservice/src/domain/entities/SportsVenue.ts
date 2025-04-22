export enum SportsVenueType {
  five_vs_five = '5x5',
  seven_vs_seven = '7x7',
  nine_vs_nive = '9x9',
  eleven_vs_eleven = '11x11',
}

export enum SportsVenueStatus {
  active = 'active',
  inactive = 'inactive',
}

export class SportsVenue {
  public id?: string;
  public ownerId?: string;
  public sportsVenueType: SportsVenueType;
  public status: SportsVenueStatus;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(sportsVenue: {
    id?: string;
    ownerId?: string;
    sportsVenueType: SportsVenueType;
    status: SportsVenueStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = sportsVenue.id;
    this.ownerId = sportsVenue.ownerId;
    this.sportsVenueType = sportsVenue.sportsVenueType;
    this.status = sportsVenue.status;
    this.createdAt = sportsVenue.createdAt;
    this.updatedAt = sportsVenue.updatedAt;
  }
  getId(): string {
    return this.id ? this.id : 'N/A';
  }

  static fromMongooseDocument(doc: any): SportsVenue {
    return new SportsVenue({
      id: doc._id.toString(),
      ownerId: doc.ownerId.toString(),
      sportsVenueType: doc.sportsVenueType,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
