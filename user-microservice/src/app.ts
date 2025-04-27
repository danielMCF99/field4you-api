import bodyParser from 'body-parser';
import express, { Application } from 'express';
import user from 'firebase-admin';
import config from './config/env';
import { MongoUserRepository } from './infrastructure/repositories/MongoUserRepository';
import userRoutes from './web/routes/userRoutes';
import { FirebaseImplementation } from './infrastructure/firebase/firebase';
import { MongoOwnerRequestRepository } from './infrastructure/repositories/MongoOwnerRequestRepository';

const app: Application = express();
app.disable('x-powered-by');

user.initializeApp({
  credential: user.credential.cert(config.firebaseConfig),
  storageBucket: 'gs://plat-centro-neurosensorial.appspot.com',
});
export const bucket = user.storage().bucket();

export const userRepository = MongoUserRepository.getInstance();
export const firebase = FirebaseImplementation.getInstance();
export const ownerRequestRepository = MongoOwnerRequestRepository.getInstance();

/* Middlewares */
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(userRoutes);

export default app;
