export class User {
  private id?: string;
  public userType: string;
  public email: string;
  public password: string;
  public firstName: string;
  public lastName: string;
  public birthDate: string;
  public registerDate: Date;
  public lastAccessDate: Date;
  public resetPasswordToken?: string;
  public resetPasswordExpires?: Date;

  constructor(user: {
    id?: string;
    userType: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
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
    });
  }
}
