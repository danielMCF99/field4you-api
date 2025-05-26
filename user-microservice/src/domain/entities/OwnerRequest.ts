export enum Status {
  pending = 'Pending',
  approved = 'Approved',
  rejected = 'Rejected',
}

export class OwnerRequest {
  public readonly id?: string;
  public userId: string;
  public message?: string;
  public status: Status;
  public response?: string;
  public reviewedAt?: Date;
  public reviewedBy?: string;
  public requestNumber?: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(ownerRequest: {
    id?: string;
    userId: string;
    message?: string;
    status: Status;
    response?: string;
    createdAt?: Date;
    updatedAt?: Date;
    reviewedAt?: Date;
    reviewedBy?: string;
    requestNumber?: string;
  }) {
    this.id = ownerRequest.id;
    this.userId = ownerRequest.userId;
    this.message = ownerRequest.message;
    this.status = ownerRequest.status;
    this.response = ownerRequest.response;
    this.createdAt = ownerRequest.createdAt;
    this.updatedAt = ownerRequest.updatedAt;
    this.reviewedAt = ownerRequest.reviewedAt;
    this.reviewedBy = ownerRequest.reviewedBy;
    this.requestNumber = ownerRequest.requestNumber;
  }

  getId(): string {
    return this.id ? this.id : 'N/A';
  }
  getOwnerId(): string {
    return this.userId ? this.userId : 'N/A';
  }

  static fromMongooseDocument(doc: any): OwnerRequest {
    return new OwnerRequest({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      message: doc.message,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      reviewedAt: doc.reviewedAt,
      reviewedBy: doc.reviewedBy,
      requestNumber: doc.requestNumber,
    });
  }
}
