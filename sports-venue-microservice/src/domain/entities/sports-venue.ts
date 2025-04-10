export class Location {
  public address?: string;
  public city?: string;
  public district?: string;
  public latitude?: number;
  public longitude?: number;
}

export class SportsVenue {
  public id?: string;
  public ownerId: string;
  public sportsVenueType: string;
  public status: string;
  public sportsVenueName: string;
  public bookingMinDuration: number;
  public bookingMinPrice: number;
  public sportsVenuePicture: string;
  public hasParking: boolean;
  public hasShower: boolean;
  public hasBar: boolean;
  public location: Location;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(sportsVenue: {
    id?: string;
    ownerId: string;
    sportsVenueType: string;
    status: string;
    sportsVenueName: string;
    bookingMinDuration: number;
    bookingMinPrice: number;
    sportsVenuePicture: string;
    hasParking: boolean;
    hasShower: boolean;
    hasBar: boolean;
    location: Location;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = sportsVenue.id;
    this.ownerId = sportsVenue.ownerId;
    this.sportsVenueType = sportsVenue.sportsVenueType;
    this.status = sportsVenue.status;
    this.sportsVenueName = sportsVenue.sportsVenueName;
    this.bookingMinDuration = sportsVenue.bookingMinDuration;
    this.bookingMinPrice = sportsVenue.bookingMinPrice;
    this.sportsVenuePicture = sportsVenue.sportsVenuePicture;
    this.hasParking = sportsVenue.hasParking;
    this.hasShower = sportsVenue.hasShower;
    this.hasBar = sportsVenue.hasBar;
    this.location = sportsVenue.location;
    this.createdAt = sportsVenue.createdAt;
    this.updatedAt = sportsVenue.updatedAt;
  }
  getId(): string {
    return this.id ? this.id : 'N/A';
  }

  getLocation(): Location {
    return this.location;
  }

  static fromMongooseDocument(doc: any): SportsVenue {
    return new SportsVenue({
      id: doc._id.toString(),
      ownerId: doc.ownerId.toString(),
      sportsVenueType: doc.sportsVenueType,
      status: doc.status,
      sportsVenueName: doc.sportsVenueName,
      bookingMinDuration: doc.bookingMinDuration,
      bookingMinPrice: doc.bookingMinPrice,
      sportsVenuePicture: doc.sportsVenuePicture,
      hasParking: doc.hasParking,
      hasShower: doc.hasShower,
      hasBar: doc.hasBar,
      location: doc.location,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
