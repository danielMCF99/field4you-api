import { BookingInviteStatus } from '../../domain/entities/BookingInvite';

export function validateBookingInviteStatusTransition(
  currentStatus: BookingInviteStatus,
  nextStatus: BookingInviteStatus
): Boolean {
  switch (currentStatus) {
    case BookingInviteStatus.accepted:
      console.log(`Invite status transition from accepted to ${nextStatus}`);
      return false;

    case BookingInviteStatus.pending:
      console.log(`Invite status transition from pending to ${nextStatus}`);
      return true;

    case BookingInviteStatus.rejected:
      console.log(`Invite status transition from rejected to ${nextStatus}`);
      return false;

    default:
      return false;
  }
}
