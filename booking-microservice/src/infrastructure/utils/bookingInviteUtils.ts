import { BookingInviteStatus } from '../../domain/entities/BookingInvite';

export function validateBookingInviteStatusTransition(
  currentStatus: BookingInviteStatus,
  nextStatus: BookingInviteStatus
): Boolean {
  switch (currentStatus) {
    case BookingInviteStatus.accepted:
      return false;

    case BookingInviteStatus.pending:
      return true;

    case BookingInviteStatus.rejected:
      return false;

    default:
      return false;
  }
}
