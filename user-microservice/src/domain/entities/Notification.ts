export enum NotificationStatus {
  read = 'Read',
  unread = 'Unread',
}

export class Notification {
  private readonly id?: string;
  public userId: string;
  public ownerRequestId: string;
  public isApprovedRequest?: Boolean;
  public userEmail: string;
  public phoneNumber?: string;
  public status: NotificationStatus;
  public content?: string;
  public adminOnly: Boolean;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(notification: {
    id?: string;
    userId: string;
    ownerRequestId: string;
    isApprovedRequest?: Boolean;
    userEmail: string;
    phoneNumber?: string;
    status: NotificationStatus;
    content?: string;
    adminOnly: Boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = notification.id;
    this.userId = notification.userId;
    this.ownerRequestId = notification.ownerRequestId;
    this.isApprovedRequest = notification.isApprovedRequest;
    this.userEmail = notification.userEmail;
    this.phoneNumber = notification.phoneNumber;
    this.status = notification.status;
    this.content = notification.content;
    this.adminOnly = notification.adminOnly;
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
      ownerRequestId: doc.ownerRequestId,
      isApprovedRequest: doc.isApprovedRequest,
      userEmail: doc.userEmail,
      phoneNumber: doc.phoneNumber,
      status: doc.status,
      content: doc.content,
      adminOnly: doc.adminOnly,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
