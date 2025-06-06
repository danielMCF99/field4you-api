import { Request, Response, Router } from 'express';
import swaggerDocument from '../../docs/swagger/swagger.json';
import {
  createBookingController,
  deleteBookingController,
  getAllBookingsController,
  getBookingByIdController,
  getBookingTimeSlotsController,
  getRecentBookingsController,
  getRecentBookingsProfitController,
  getSimpleBookingsController,
  getWebGraphicsController,
  updateBookingController,
  updateBookingStatusController,
} from '../controllers/bookingController';
import {
  getAllBookingInvitesController,
  updateBookingInviteStatusController,
} from '../controllers/bookingInviteController';

const router = Router();

router.get('/bookings/swagger', async (req: Request, res: Response) => {
  res.status(200).send(swaggerDocument);
});

router.get('/bookings/invites', getAllBookingInvitesController);
router.patch(
  '/bookings/invites/:id/status',
  updateBookingInviteStatusController
);

router.post('/bookings/create', createBookingController);
router.get('/bookings', getAllBookingsController);
router.get('/bookings/recent', getRecentBookingsController);
router.get('/bookings/recent-profit', getRecentBookingsProfitController);
router.get('/bookings/web-graphics', getWebGraphicsController);
router.get('/bookings/simple', getSimpleBookingsController);
router.get('/bookings/timeslots', getBookingTimeSlotsController);
router.patch('/bookings/:id/status', updateBookingStatusController);
router.put('/bookings/:id', updateBookingController);
router.get('/bookings/:id', getBookingByIdController);
router.delete('/bookings/:id', deleteBookingController);

export default router;
