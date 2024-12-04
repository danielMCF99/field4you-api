import express, { Application } from 'express';
import bodyParser from 'body-parser';
import config from './config/env';
import { connectToDB } from './infrastructure/database/database';
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

const startServer = async () => {
  try {
    await connectToDB();

    /* Middlewares */
    app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

    // Swagger endpoint
    app.use('/users/swagger', serve, setup(swaggerDocument));

    app.use(userRoutes);

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};

startServer();
