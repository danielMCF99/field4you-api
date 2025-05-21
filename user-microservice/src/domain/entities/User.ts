export enum UserType {
  user = 'User',
  owner = 'Owner',
  admin = 'Admin',
}

export enum UserStatus {
  active = 'Active',
  inactive = 'Inactive',
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
  public status: UserStatus;
  public phoneNumber?: string;
  public firstName: string;
  public lastName: string;
  public location: Location;
  public birthDate: string;
  public fileName?: string;
  public imageURL?: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(user: {
    id?: string;
    userType: UserType;
    email: string;
    status: UserStatus;
    phoneNumber?: string;
    firstName: string;
    lastName: string;
    location: Location;
    birthDate: string;
    fileName?: string;
    imageURL?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = user.id;
    this.userType = user.userType;
    this.email = user.email;
    this.status = user.status;
    this.phoneNumber = user.phoneNumber;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.location = user.location;
    this.birthDate = user.birthDate;
    this.fileName = user.fileName;
    this.imageURL = user.imageURL;
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
      status: doc.status,
      email: doc.email,
      phoneNumber: doc.phoneNumber,
      firstName: doc.firstName,
      lastName: doc.lastName,
      location: doc.location,
      birthDate: doc.birthDate,
      fileName: doc.fileName,
      imageURL: doc.imageURL,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
