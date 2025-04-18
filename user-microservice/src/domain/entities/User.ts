export enum UserType {
  user = "user",
  owner = "owner",
}

export class Location {
  public address?: string;
  public city?: string;
  public district?: string;
  public latitude?: number;
  public longitude?: number;
}

export class User {
  private readonly id?: string;
  public userType: UserType;
  public email: string;
  public phoneNumber?: string;
  public firstName: string;
  public lastName: string;
  public location: Location;
  public birthDate: string;
  public registerDate: Date;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(user: {
    id?: string;
    userType: UserType;
    email: string;
    phoneNumber?: string;
    firstName: string;
    lastName: string;
    location: Location;
    birthDate: string;
    registerDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = user.id;
    this.userType = user.userType;
    this.email = user.email;
    this.phoneNumber = user.phoneNumber;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.location = user.location;
    this.birthDate = user.birthDate;
    this.registerDate = user.registerDate;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  getId(): string {
    return this.id ? this.id : "N/A";
  }

  getLocation(): Location {
    return this.location;
  }

  static fromMongooseDocument(doc: any): User {
    return new User({
      id: doc._id.toString(), // Convert ObjectId to string
      userType: doc.userType,
      email: doc.email,
      phoneNumber: doc.phoneNumber,
      firstName: doc.firstName,
      lastName: doc.lastName,
      location: doc.location,
      birthDate: doc.birthDate,
      registerDate: doc.registerDate,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
