import { bookingInviteRepository, bookingRepository } from '../app';
import { BookingStatus } from '../domain/entities/Booking';
import { BookingInviteStatus } from '../domain/entities/BookingInvite';
import { publishFinishedBooking } from '../infrastructure/rabbitmq/rabbitmq.publisher';

export const autoUpdateBookingsToDone = async (): Promise<void> => {
  const now = new Date();
  const expiredBookings = await bookingRepository.findAll({
    status: BookingStatus.confirmed,
    bookingEndDate: now,
  });
  for (const booking of expiredBookings) {
    try {
      const updated = await bookingRepository.updateStatus(
        booking.getId(),
        BookingStatus.done
      );
      if (!updated) {
        console.warn(`Erro ao atualizar booking ${booking.getId()}`);
        continue;
      }

      const acceptedInvites = await bookingInviteRepository.findAll({
        status: BookingInviteStatus.accepted,
        bookingId: booking.getId(),
      });

      const invitedUsersPayload = acceptedInvites.map((invite) => ({
        userId: invite.getUserId(),
        bookingId: invite.getBookingId(),
        sportsVenueId: booking.sportsVenueId,
      }));

      await publishFinishedBooking({ invitedUserIds: invitedUsersPayload });

      const pendingInvites = await bookingInviteRepository.findAll({
        status: BookingInviteStatus.pending,
        bookingId: booking.getId(),
      });

      const invitesIDs = pendingInvites.map((invite) => invite.getId());

      await bookingInviteRepository.bulkUpdateStatusByIds(
        invitesIDs,
        BookingInviteStatus.rejected,
        'Booking status was updated to done and invite was in pending status'
      );

      console.log(`Booking ${booking.getId()} atualizado com sucesso.`);
    } catch (err) {
      console.error(`Erro ao processar booking ${booking.getId()}:`, err);
    }
  }
};
