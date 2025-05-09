// Load environment variables
import bodyParser from 'body-parser';
import express, { Application } from 'express';
import { JwtHelperImplementation } from './infrastructure/jwt/jwtHelper';
import { MailerImplementation } from './infrastructure/mailer/mailer';
import { MongoAuthRepository } from './infrastructure/repositories/MongoAuthRepository';
import { MongoLoginHistoryRepository } from './infrastructure/repositories/MongoLoginHistoryRepository';
import authRoutes from './web/routes/authRoutes';

const app: Application = express();
export const authRepository = MongoAuthRepository.getInstance();
export const loginHistoryRepository = MongoLoginHistoryRepository.getInstance();
export const jwtHelper = JwtHelperImplementation.getInstance();
export const mailer = MailerImplementation.getInstance();

/* Middlewares */
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(authRoutes);

export default app;
