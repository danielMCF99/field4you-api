export enum UserType {
  user = 'User',
  owner = 'Owner',
  admin = 'Admin',
}

export enum UserStatus {
  active = 'Active',
  inactive = 'Inactive',
}

export class User {
  private id?: string;
  public userType: UserType;
  public email: string;
  public status: UserStatus;
  public pushNotificationToken?: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(user: {
    id?: string;
    userType: UserType;
    email: string;
    status: UserStatus;
    pushNotificationToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = user.id;
    this.userType = user.userType;
    this.email = user.email;
    this.status = user.status;
    this.pushNotificationToken = user.pushNotificationToken;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  getId(): string {
    return this.id ? this.id : 'N/A';
  }

  static fromMongooseDocument(doc: any): User {
    return new User({
      id: doc._id.toString(), // Convert ObjectId to string
      userType: doc.userType,
      email: doc.email,
      status: doc.status,
      pushNotificationToken: doc.pushNotificationToken,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
