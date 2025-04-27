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

export class Location {
  public address?: string;
  public city?: string;
  public district?: string;
  public latitude?: number;
  public longitude?: number;
}

export class SportsVenueImage{
  public fileName?: string;
  public imageURL?: string;
}

export class SportsVenue {
  public id?: string;
  public ownerId: string;
  public sportsVenueType: SportsVenueType;
  public status: SportsVenueStatus;
  public sportsVenueName: string;
  public bookingMinDuration: number;
  public bookingMinPrice: number;
  public sportsVenuePictures: SportsVenueImage[];
  public hasParking: boolean;
  public hasShower: boolean;
  public hasBar: boolean;
  public location: Location;
  public rating?: number;
  public numberOfRatings?: number;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(sportsVenue: {
    id?: string;
    ownerId: string;
    sportsVenueType: SportsVenueType;
    status: SportsVenueStatus;
    sportsVenueName: string;
    bookingMinDuration: number;
    bookingMinPrice: number;
    sportsVenuePictures?: SportsVenueImage[];
    hasParking: boolean;
    hasShower: boolean;
    hasBar: boolean;
    location: Location;
    rating?: number;
    numberOfRatings?: number;
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
    this.sportsVenuePictures = sportsVenue.sportsVenuePictures ?? [];
    this.hasParking = sportsVenue.hasParking;
    this.hasShower = sportsVenue.hasShower;
    this.hasBar = sportsVenue.hasBar;
    this.location = sportsVenue.location;
    this.rating = sportsVenue.rating;
    this.numberOfRatings = sportsVenue.numberOfRatings;
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
      sportsVenuePictures: doc.sportsVenuePictures,
      hasParking: doc.hasParking,
      hasShower: doc.hasShower,
      hasBar: doc.hasBar,
      location: doc.location,
      rating: doc.rating,
      numberOfRatings: doc.numberOfRatings,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
