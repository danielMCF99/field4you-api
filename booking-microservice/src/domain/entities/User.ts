export enum UserType {
  'user',
  'owner',
}

export class User {
  private id?: string;
  private authServiceUserId: string;
  public userType: UserType;
  public email: string;
  public phoneNumber?: string;
  public firstName: string;
  public lastName: string;

  constructor(user: {
    id?: string;
    authServiceUserId: string;
    userType: UserType;
    email: string;
    phoneNumber?: string;
    firstName: string;
    lastName: string;
  }) {
    this.id = user.id;
    this.authServiceUserId = user.authServiceUserId;
    this.userType = user.userType;
    this.email = user.email;
    this.phoneNumber = user.phoneNumber;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
  }

  getId(): string {
    return this.id ? this.id : 'N/A';
  }

  getAuthServiceUserId(): string {
    return this.authServiceUserId ? this.authServiceUserId : 'N/A';
  }

  static fromMongooseDocument(doc: any): User {
    return new User({
      id: doc._id.toString(), // Convert ObjectId to string
      authServiceUserId: doc.authServiceUserId,
      userType: doc.userType,
      email: doc.email,
      phoneNumber: doc.phoneNumber,
      firstName: doc.firstName,
      lastName: doc.lastName,
    });
  }
}
