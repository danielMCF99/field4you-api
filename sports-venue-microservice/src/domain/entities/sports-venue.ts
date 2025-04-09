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
  public address?: string;
  public city?: string;
  public district?: string;
  public latitude?: number;
  public longitude?: number;

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
    district?: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
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
    this.district = sportsVenue.district;
    this.city = sportsVenue.city;
    this.address = sportsVenue.address;
    this.latitude = sportsVenue.latitude;
    this.longitude = sportsVenue.longitude;
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
      sportsVenueName: doc.sportsVenueName,
      bookingMinDuration: doc.bookingMinDuration,
      bookingMinPrice: doc.bookingMinPrice,
      sportsVenuePicture: doc.sportsVenuePicture,
      hasParking: doc.hasParking,
      hasShower: doc.hasShower,
      hasBar: doc.hasBar,
      district: doc.district,
      city: doc.city,
      address: doc.address,
      latitude: doc.latitude,
      longitude: doc.longitude,
    });
  }
}
