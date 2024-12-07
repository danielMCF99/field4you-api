import express, { Application } from "express";
import bookingRoutes from "./web/routes/bookingRoutes";
import config from "./config/env";
import { connectDB } from "./infrastructure/database/database";
import { MongoBookingRepository } from "./infrastructure/repositories/MongoBookingRepository";
import { JwtHelperImplementation } from "./infrastructure/jwt/jwtHelper";
import { AuthMiddlewareImplementation } from "./infrastructure/middlewares/auth.middleware";
import swaggerDocument from "./docs/swagger/swagger.json";
import { serve, setup } from "swagger-ui-express";

const app: Application = express();
export const bookingRepository = MongoBookingRepository.getInstance();
export const jwtHelper = JwtHelperImplementation.getInstance();
export const authMiddleware = AuthMiddlewareImplementation.getInstance();

app.use(express.json());
app.use("/bookings/swagger", serve, setup(swaggerDocument));
app.use(bookingRoutes);

export default app;
