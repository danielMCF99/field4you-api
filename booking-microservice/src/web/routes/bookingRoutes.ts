import { Request, Response, Router } from 'express';
import {
  createBookingController,
  updateBookingController,
  getBookingByIdController,
  getAllBookingsController,
  deleteBookingController,
} from '../controllers/bookingController';
import swaggerDocument from '../../docs/swagger/swagger.json';

const router = Router();

router.get('/bookings/swagger', async (req: Request, res: Response) => {
  res.status(200).send(swaggerDocument);
});

router.post('/bookings/create', createBookingController);
router.get('/bookings/all', getAllBookingsController);
router.put('/bookings/:id/status', updateBookingController);
router.put('/bookings/:id', updateBookingController);
router.get('/bookings/:id', getBookingByIdController);
router.delete('/bookings/:id', deleteBookingController);

export default router;
