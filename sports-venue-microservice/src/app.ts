import express, { Application } from "express";
import sportsVenueRoutes from "./web/routes/sports-venueRoutes";
import { MongoSportsVenueRepository } from "./infrastructure/repositories/MongoSportsVenueRepository";
import { JwtHelperImplementation } from "./infrastructure/jwt/jwtHelper";
import { AuthMiddlewareImplementation } from "./infrastructure/middlewares/auth.middleware";

const app: Application = express();
export const sportsVenueRepository = MongoSportsVenueRepository.getInstance();
export const jwtHelper = JwtHelperImplementation.getInstance();
export const authMiddleware = AuthMiddlewareImplementation.getInstance();

app.use(express.json());

app.use(sportsVenueRoutes);

export default app;
