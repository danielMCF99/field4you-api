import { BookingStatus } from '../../domain/entities/Booking';

export function validateBookingStatusTransition(
  currentStatus: BookingStatus,
  nextStatus: BookingStatus
): Boolean {
  switch (currentStatus) {
    case BookingStatus.active:
      console.log(`Booking status transition from active to ${nextStatus}`);
      return true;

    case BookingStatus.cancelled:
      console.log(`Booking status transition from cancelled to ${nextStatus}`);
      return true;

    case BookingStatus.done:
      console.log(`Booking status transition from done to ${nextStatus}`);
      return false;

    case BookingStatus.confirmed:
      console.log(`Booking status transition from confirmed to ${nextStatus}`);
      return true;

    default:
      return false;
  }
}
