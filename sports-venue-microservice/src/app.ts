import express, { Application } from 'express';
import { MongoBookingInviteRepository } from './infrastructure/repositories/MongoBookingInviteRepository';
import { MongoSportsVenueRepository } from './infrastructure/repositories/MongoSportsVenueRepository';
import sportsVenueRoutes from './web/routes/sports-venueRoutes';

const app: Application = express();
export const sportsVenueRepository = MongoSportsVenueRepository.getInstance();
export const bookingInviteRepository =
  MongoBookingInviteRepository.getInstance();

app.use(express.json());

app.use(sportsVenueRoutes);

export default app;
