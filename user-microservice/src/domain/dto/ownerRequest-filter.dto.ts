export interface OwnerRequestFilterParams {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'createdAt' | 'status';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
