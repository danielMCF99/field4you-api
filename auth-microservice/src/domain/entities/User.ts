export enum UserType {
  'user',
  'owner',
}

export class User {
  private id?: string;
  public userType: UserType;
  public email: string;
  public password: string;
  public firstName: string;
  public lastName: string;
  public address?: string;
  public city?: string;
  public district?: string;
  public latitude?: number;
  public longitude?: number;
  public birthDate: string;
  public registerDate: Date;
  public lastAccessDate: Date;
  public resetPasswordToken?: string;
  public resetPasswordExpires?: Date;

  constructor(user: {
    id?: string;
    userType: UserType;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    district?: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    birthDate: string;
    registerDate: Date;
    lastAccessDate: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
  }) {
    this.id = user.id;
    this.userType = user.userType;
    this.email = user.email;
    this.password = user.password;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.district = user.district;
    this.city = user.city;
    this.address = user.address;
    this.latitude = user.latitude;
    this.longitude = user.longitude;

    this.birthDate = user.birthDate;
    this.registerDate = user.registerDate;
    this.lastAccessDate = user.lastAccessDate;
    this.resetPasswordToken = user.resetPasswordToken;
    this.resetPasswordExpires = user.resetPasswordExpires;
  }

  getId(): string {
    return this.id ? this.id : 'N/A';
  }

  static fromMongooseDocument(doc: any): User {
    return new User({
      id: doc._id.toString(), // Convert ObjectId to string
      userType: doc.userType,
      email: doc.email,
      password: doc.password,
      firstName: doc.firstName,
      lastName: doc.lastName,
      birthDate: doc.birthDate,
      registerDate: doc.registerDate,
      lastAccessDate: doc.lastAccessDate,
      resetPasswordToken: doc.resetPasswordToken,
      resetPasswordExpires: doc.resetPasswordExpires,
      district: doc.district,
      city: doc.city,
      address: doc.address,
      latitude: doc.latitude,
      longitude: doc.longitude,
    });
  }
}
