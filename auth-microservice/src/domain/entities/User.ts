export enum UserType {
  'user',
  'owner',
}

export class User {
  private id?: string;
  public userType: UserType;
  public email: string;
  public password: string;
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

  static fromMongooseDocument(doc: any): User {
    return new User({
      id: doc._id.toString(), // Convert ObjectId to string
      userType: doc.userType,
      email: doc.email,
      password: doc.password,
      registerDate: doc.registerDate,
      lastAccessDate: doc.lastAccessDate,
      resetPasswordToken: doc.resetPasswordToken,
      resetPasswordExpires: doc.resetPasswordExpires,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
