import { BookingStatus } from '../../domain/entities/Booking';

export function validateBookingStatusTransition(
  currentStatus: BookingStatus,
  nextStatus: BookingStatus
): Boolean {
  switch (currentStatus) {
    case BookingStatus.active:
      return true;

    case BookingStatus.cancelled:
      return true;

    case BookingStatus.done:
      return false;

    default:
      return false;
  }
}
