export enum NotificationStatus {
  read = 'Read',
  unread = 'Unread',
}

export class Notification {
  private readonly id?: string;
  public userId: string;
  public status: NotificationStatus;
  public content: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(notification: {
    id?: string;
    userId: string;
    status: NotificationStatus;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = notification.id;
    this.userId = notification.userId;
    this.status = notification.status;
    this.content = notification.content;
    this.createdAt = notification.createdAt;
    this.updatedAt = notification.updatedAt;
  }

  getId(): string {
    return this.id ? this.id : 'N/A';
  }

  static fromMongooseDocument(doc: any): Notification {
    return new Notification({
      id: doc._id.toString(), // Convert ObjectId to string
      userId: doc.userId,
      status: doc.status,
      content: doc.content,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
