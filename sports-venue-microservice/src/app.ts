import express, { Application } from 'express';
import { MongoSportsVenueRepository } from './infrastructure/repositories/MongoSportsVenueRepository';
import sportsVenueRoutes from './web/routes/sports-venueRoutes';

const app: Application = express();
export const sportsVenueRepository = MongoSportsVenueRepository.getInstance();

app.use(express.json());

app.use(sportsVenueRoutes);

export default app;
