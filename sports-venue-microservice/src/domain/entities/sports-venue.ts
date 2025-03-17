export class SportsVenue {
  public id?: string;
  public ownerId: string;
  public location: string;
  public sportsVenueType: string;
  public status: string;
  public sportsVenueName: string;
  public bookingMinDuration: number;
  public bookingMinPrice: number;
  public sportsVenuePicture: string;
  public hasParking: boolean;
  public hasShower: boolean;
  public hasBar: boolean;

  constructor(sportsVenue: {
    id?: string;
    ownerId: string;
    location: string;
    sportsVenueType: string;
    status: string;
    sportsVenueName: string;
    bookingMinDuration: number;
    bookingMinPrice: number;
    sportsVenuePicture: string;
    hasParking: boolean;
    hasShower: boolean;
    hasBar: boolean;
  }) {
    this.id = sportsVenue.id;
    this.ownerId = sportsVenue.ownerId;
    this.location = sportsVenue.location;
    this.sportsVenueType = sportsVenue.sportsVenueType;
    this.status = sportsVenue.status;
    this.sportsVenueName = sportsVenue.sportsVenueName;
    this.bookingMinDuration = sportsVenue.bookingMinDuration;
    this.bookingMinPrice = sportsVenue.bookingMinPrice;
    this.sportsVenuePicture = sportsVenue.sportsVenuePicture;
    this.hasParking = sportsVenue.hasParking;
    this.hasShower = sportsVenue.hasShower;
    this.hasBar = sportsVenue.hasBar;
  }
  getId(): string {
    return this.id ? this.id : 'N/A';
  }

  static fromMongooseDocument(doc: any): SportsVenue {
    return new SportsVenue({
      id: doc._id.toString(),
      ownerId: doc.ownerId.toString(),
      location: doc.location,
      sportsVenueType: doc.sportsVenueType,
      status: doc.status,
      sportsVenueName: doc.sportsVenueName,
      bookingMinDuration: doc.bookingMinDuration,
      bookingMinPrice: doc.bookingMinPrice,
      sportsVenuePicture: doc.sportsVenuePicture,
      hasParking: doc.hasParking,
      hasShower: doc.hasShower,
      hasBar: doc.hasBar,
    });
  }
}
