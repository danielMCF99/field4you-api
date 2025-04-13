import { Request, Response, Router } from 'express';
import swaggerDocument from '../../docs/swagger/swagger.json';
import {
  createBookingController,
  deleteBookingController,
  getAllBookingsController,
  getBookingByIdController,
  updateBookingController,
  updateBookingStatusController,
} from '../controllers/bookingController';

const router = Router();

router.get('/bookings/swagger', async (req: Request, res: Response) => {
  res.status(200).send(swaggerDocument);
});

router.post('/bookings/create', createBookingController);
router.get('/bookings/', getAllBookingsController);
router.patch('/bookings/:id/status', updateBookingStatusController);
router.put('/bookings/:id', updateBookingController);
router.get('/bookings/:id', getBookingByIdController);
router.delete('/bookings/:id', deleteBookingController);

export default router;
