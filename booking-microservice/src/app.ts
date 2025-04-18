import express, { Application } from 'express';
import { MongoBookingInviteRepository } from './infrastructure/repositories/MongoBookingInviteRepository';
import { MongoBookingRepository } from './infrastructure/repositories/MongoBookingRepository';
import { MongoSportsVenueRepository } from './infrastructure/repositories/MongoSportsVenueRepository';
import { MongoUserRepository } from './infrastructure/repositories/MongoUserRepository';
import bookingRoutes from './web/routes/bookingRoutes';

const app: Application = express();
export const bookingRepository = MongoBookingRepository.getInstance();
export const userRepository = MongoUserRepository.getInstance();
export const sportsVenueRepository = MongoSportsVenueRepository.getInstance();
export const bookingInviteRepository =
  MongoBookingInviteRepository.getInstance();

app.use(express.json());
app.use(bookingRoutes);

export default app;
