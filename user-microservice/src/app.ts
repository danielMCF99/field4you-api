import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { MongoUserRepository } from './infrastructure/repositories/MongoUserRepository';
import userRoutes from './web/routes/userRoutes';
import { serve, setup } from 'swagger-ui-express';
import swaggerDocument from './docs/swagger/swagger.json';
import { JwtHelperImplementation } from './infrastructure/jwt/jwtHelper';
import { AuthMiddlewareImplementation } from './infrastructure/middlewares/auth.middleware';

const app: Application = express();
export const userRepository = MongoUserRepository.getInstance();
export const jwtHelper = JwtHelperImplementation.getInstance();
export const authMiddleware = AuthMiddlewareImplementation.getInstance();

/* Middlewares */
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

// Swagger endpoint
//app.use('/users/swagger', serve, setup(swaggerDocument));

app.use(userRoutes);

export default app;
