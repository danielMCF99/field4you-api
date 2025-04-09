export enum UserType {
  'user',
  'owner',
}

export class User {
  private id?: string;
  public userType: UserType;
  public email: string;
  public phoneNumber?: string;
  public firstName: string;
  public lastName: string;
  public address?: string;
  public city?: string;
  public district?: string;
  public latitude?: number;
  public longitude?: number;

  constructor(user: {
    id?: string;
    userType: UserType;
    email: string;
    phoneNumber?: string;
    firstName: string;
    lastName: string;
    district?: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  }) {
    this.id = user.id;
    this.userType = user.userType;
    this.email = user.email;
    this.phoneNumber = user.phoneNumber;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.district = user.district;
    this.city = user.city;
    this.address = user.address;
    this.latitude = user.latitude;
    this.longitude = user.longitude;
  }

  getId(): string {
    return this.id ? this.id : 'N/A';
  }

  static fromMongooseDocument(doc: any): User {
    return new User({
      id: doc._id.toString(), // Convert ObjectId to string
      userType: doc.userType,
      email: doc.email,
      phoneNumber: doc.phoneNumber,
      firstName: doc.firstName,
      lastName: doc.lastName,
      district: doc.district,
      city: doc.city,
      address: doc.address,
      latitude: doc.latitude,
      longitude: doc.longitude,
    });
  }
}
