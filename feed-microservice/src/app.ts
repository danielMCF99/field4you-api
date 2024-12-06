import express, { Application } from 'express';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import { serve, setup } from 'swagger-ui-express';
import config from './config/env';
import { JwtHelperImplementation } from './infrastructure/jwt/jwtHelper';
import { AuthMiddlewareImplementation } from './infrastructure/middlewares/auth.middleware';
import { MongoPostRepository } from './infrastructure/repositories/MongoPostRepository';
import postRoutes from './web/routes/postRoutes';
import swaggerDocument from './docs/swagger/swagger.json';
import { FirebaseImplementation } from './infrastructure/middlewares/firebase';

const app: Application = express();

admin.initializeApp({
  credential: admin.credential.cert(config.firebaseConfig),
  storageBucket: 'gs://plat-centro-neurosensorial.appspot.com',
});
export const bucket = admin.storage().bucket();

export const postRepository = MongoPostRepository.getInstance();
export const jwtHelper = JwtHelperImplementation.getInstance();
export const authMiddleware = AuthMiddlewareImplementation.getInstance();
export const firebase = FirebaseImplementation.getInstance();

/* Middlewares */
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

// Swagger endpoint
app.use('/posts/swagger', serve, setup(swaggerDocument));

app.use(postRoutes);

export default app;
