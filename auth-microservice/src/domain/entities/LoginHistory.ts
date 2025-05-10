export class LoginHistory {
  private id?: string;
  public userId: string;
  public loginDate: Date;

  constructor(loginHistory: { id?: string; userId: string; loginDate: Date }) {
    this.id = loginHistory.id;
    this.userId = loginHistory.userId;
    this.loginDate = loginHistory.loginDate;
  }

  getId(): string {
    return this.id ? this.id : 'N/A';
  }

  static fromMongooseDocument(doc: any): LoginHistory {
    return new LoginHistory({
      id: doc._id.toString(), // Convert ObjectId to string
      userId: doc.userId,
      loginDate: doc.loginDate,
    });
  }
}
