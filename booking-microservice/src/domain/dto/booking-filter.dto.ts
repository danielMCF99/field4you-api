export interface BookingFilterParams {
  title?: string;
  status?: string;
  bookingType?: string;
  bookingStartDate?: Date;
  bookingEndDate?: Date;
  page?: number;
  limit?: number;
  }