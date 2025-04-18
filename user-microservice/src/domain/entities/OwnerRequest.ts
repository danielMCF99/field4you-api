export enum Status {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
}

export class OwnerRequest {
  public readonly id?: string;
  public userId: string;
  public message?: string;
  public status: Status;
  public response?: string;
  public submittedAt: Date;
  public reviewedAt?: Date;
  public reviewedBy?: string;

  constructor(ownerRequest: {
    id?: string;
    userId: string;
    message?: string;
    status: Status;
    response?: string;
    submittedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string;
  }) {
    this.id = ownerRequest.id;
    this.userId = ownerRequest.userId;
    this.message = ownerRequest.message;
    this.status = ownerRequest.status;
    this.response = ownerRequest.response;
    this.submittedAt = ownerRequest.submittedAt;
    this.reviewedAt = ownerRequest.reviewedAt;
    this.reviewedBy = ownerRequest.reviewedBy;
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
      submittedAt: doc.submittedAt,
      reviewedAt: doc.reviewedAt,
      reviewedBy: doc.reviewedBy,
    });
  }
}
