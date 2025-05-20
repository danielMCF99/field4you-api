export enum UserType {
  user = 'User',
  owner = 'Owner',
  admin = 'Admin',
}

export enum UserStatus {
  active = 'Active',
  inactive = 'Inactive',
}

export class Auth {
  private id?: string;
  public userType: UserType;
  public email: string;
  public password: string;
  public status: UserStatus;
  public registerDate: Date;
  public lastAccessDate: Date;
  public resetPasswordToken?: string;
  public resetPasswordExpires?: Date;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(auth: {
    id?: string;
    userType: UserType;
    email: string;
    password: string;
    status: UserStatus;
    registerDate: Date;
    lastAccessDate: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = auth.id;
    this.userType = auth.userType;
    this.email = auth.email;
    this.password = auth.password;
    this.status = auth.status;
    this.registerDate = auth.registerDate;
    this.lastAccessDate = auth.lastAccessDate;
    this.resetPasswordToken = auth.resetPasswordToken;
    this.resetPasswordExpires = auth.resetPasswordExpires;
    this.createdAt = auth.createdAt;
    this.updatedAt = auth.updatedAt;
  }

  getId(): string {
    return this.id ? this.id : 'N/A';
  }

  static fromMongooseDocument(doc: any): Auth {
    return new Auth({
      id: doc._id.toString(), // Convert ObjectId to string
      userType: doc.userType,
      email: doc.email,
      password: doc.password,
      status: doc.status,
      registerDate: doc.registerDate,
      lastAccessDate: doc.lastAccessDate,
      resetPasswordToken: doc.resetPasswordToken,
      resetPasswordExpires: doc.resetPasswordExpires,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
