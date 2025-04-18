import bodyParser from 'body-parser';
import express, { Application } from 'express';
import { MongoUserRepository } from './infrastructure/repositories/MongoUserRepository';
import userRoutes from './web/routes/userRoutes';
import { MongoOwnerRequestRepository } from './infrastructure/repositories/MongoOwnerRequestRepository';

const app: Application = express();
app.disable('x-powered-by');

export const userRepository = MongoUserRepository.getInstance();
export const ownerRequestRepository = MongoOwnerRequestRepository.getInstance();

/* Middlewares */
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(userRoutes);

export default app;
