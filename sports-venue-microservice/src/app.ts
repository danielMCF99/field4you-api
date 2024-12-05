import express, { Application } from 'express';
import sportsVenueRoutes from './web/routes/sports-venueRoutes';
import config from './config/env';
import { connectDB } from './infrastructure/database/database';
import { MongoSportsVenueRepository } from './infrastructure/repositories/MongoSportsVenueRepository';
import { JwtHelperImplementation } from './infrastructure/jwt/jwtHelper';
import { AuthMiddlewareImplementation } from './infrastructure/middlewares/auth.middleware';

const app: Application = express();
export const sportsVenueRepository = MongoSportsVenueRepository.getInstance();
export const jwtHelper = JwtHelperImplementation.getInstance();
export const authMiddleware = AuthMiddlewareImplementation.getInstance();

const startServer = async () => {
  try {
    await connectDB();

    app.use(express.json());

    app.use(sportsVenueRoutes);

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};

startServer();
