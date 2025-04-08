// Load environment variables
import bodyParser from 'body-parser';
import express, { Application } from 'express';
import { JwtHelperImplementation } from './infrastructure/jwt/jwtHelper';
import { MailerImplementation } from './infrastructure/mailer/mailer';
import { MongoUserRepository } from './infrastructure/repositories/MongoUserRepository';
import authRoutes from './web/routes/authRoutes';

const app: Application = express();
export const userRepository = MongoUserRepository.getInstance();
export const jwtHelper = JwtHelperImplementation.getInstance();
export const mailer = MailerImplementation.getInstance();

/* Middlewares */
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(authRoutes);

export default app;
