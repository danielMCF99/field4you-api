import { Router } from "express";
import {
  createBookingController,
  updateBookingController,
  getBookingByIdController,
  getAllBookingsController,
  deleteBookingController,
} from "../controllers/bookingController";

const router = Router();

router.post("/bookings/create", createBookingController);
router.put("/bookings/:id", updateBookingController);
router.get("/bookings/:id", getBookingByIdController);
router.get("/bookings/all", getAllBookingsController);
router.delete("/bookings/:id", deleteBookingController);

export default router;
