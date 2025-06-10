import { Status } from '../entities/OwnerRequest';

export interface AllOwnerRequestsResponse {
  totalPages: number;
  ownerRequests: AllOwnerRequestsSummary[];
}

export interface AllOwnerRequestsSummary {
  id: string;
  userId: string;
  userEmail: string;
  userPicture?: string;
  status: Status;
  requestNumber?: string;
  createdAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}
