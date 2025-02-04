import express, { Application } from 'express';
import bookingRoutes from './web/routes/bookingRoutes';
import { MongoBookingRepository } from './infrastructure/repositories/MongoBookingRepository';
import { JwtHelperImplementation } from './infrastructure/jwt/jwtHelper';
import { AuthMiddlewareImplementation } from './infrastructure/middlewares/auth.middleware';
import { MongoUserRepository } from './infrastructure/repositories/MongoUserRepository';

const app: Application = express();
export const bookingRepository = MongoBookingRepository.getInstance();
export const userRepository = MongoUserRepository.getInstance();
export const jwtHelper = JwtHelperImplementation.getInstance();
export const authMiddleware = AuthMiddlewareImplementation.getInstance();

app.use(express.json());
app.use(bookingRoutes);

export default app;
