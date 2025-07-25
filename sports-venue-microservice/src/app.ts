import bodyParser from 'body-parser';
import express, { Application } from 'express';
import user from 'firebase-admin';
import config from './config/env';
import { FirebaseImplementation } from './infrastructure/firebase/firebase';
import { MongoBookingInviteRepository } from './infrastructure/repositories/MongoBookingInviteRepository';
import { MongoSportsVenueRepository } from './infrastructure/repositories/MongoSportsVenueRepository';
import sportsVenueRoutes from './web/routes/sports-venueRoutes';

const app: Application = express();
app.disable('x-powered-by');

user.initializeApp({
  credential: user.credential.cert(config.firebaseConfig),
  storageBucket: 'gs://plat-centro-neurosensorial.appspot.com',
});
export const bucket = user.storage().bucket();

export const sportsVenueRepository = MongoSportsVenueRepository.getInstance();
export const firebase = FirebaseImplementation.getInstance();
export const bookingInviteRepository =
  MongoBookingInviteRepository.getInstance();

/* Middlewares */
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(sportsVenueRoutes);

export default app;
