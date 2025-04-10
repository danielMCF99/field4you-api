export enum UserType {
  'user',
  'owner',
}

export class Location {
  public address?: string;
  public city?: string;
  public district?: string;
  public latitude?: number;
  public longitude?: number;
}

export class User {
  private id?: string;
  public userType: UserType;
  public email: string;
  public password: string;
  public firstName: string;
  public lastName: string;
  public location: Location;
  public birthDate: string;
  public registerDate: Date;
  public lastAccessDate: Date;
  public resetPasswordToken?: string;
  public resetPasswordExpires?: Date;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(user: {
    id?: string;
    userType: UserType;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    location: Location;
    birthDate: string;
    registerDate: Date;
    lastAccessDate: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = user.id;
    this.userType = user.userType;
    this.email = user.email;
    this.password = user.password;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.location = user.location;
    this.birthDate = user.birthDate;
    this.registerDate = user.registerDate;
    this.lastAccessDate = user.lastAccessDate;
    this.resetPasswordToken = user.resetPasswordToken;
    this.resetPasswordExpires = user.resetPasswordExpires;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  getId(): string {
    return this.id ? this.id : 'N/A';
  }

  getLocation(): Location {
    return this.location;
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
      location: doc.location,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
