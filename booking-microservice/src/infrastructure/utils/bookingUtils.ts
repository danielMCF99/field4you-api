import { BookingStatus } from '../../domain/entities/Booking';

export function validateBookingStatusTransition(
  currentStatus: BookingStatus,
  nextStatus: BookingStatus
): boolean {
  switch (currentStatus) {
    case BookingStatus.active:
      return (
        nextStatus === BookingStatus.confirmed ||
        nextStatus === BookingStatus.cancelled
      );

    case BookingStatus.confirmed:
      return (
        nextStatus === BookingStatus.done ||
        nextStatus === BookingStatus.cancelled
      );

    case BookingStatus.cancelled:
      return false;

    case BookingStatus.done:
      return false;

    default:
      return false;
  }
}
