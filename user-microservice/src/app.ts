import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { MongoUserRepository } from './infrastructure/repositories/MongoUserRepository';
import userRoutes from './web/routes/userRoutes';
import { JwtHelperImplementation } from './infrastructure/jwt/jwtHelper';
import { AuthMiddlewareImplementation } from './infrastructure/middlewares/auth.middleware';

const app: Application = express();
app.disable('x-powered-by');

export const userRepository = MongoUserRepository.getInstance();
export const jwtHelper = JwtHelperImplementation.getInstance();
export const authMiddleware = AuthMiddlewareImplementation.getInstance();

/* Middlewares */
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(userRoutes);

export default app;
