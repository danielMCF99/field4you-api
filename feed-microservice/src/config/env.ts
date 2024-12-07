import dotenv from 'dotenv';

dotenv.config();

// Configure database properties
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error(
    'The environment variable MONGODB_URI is required but is not defined.'
  );
}

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error(
    'The environment variable FIREBASE_SERVICE_ACCOUNT is required but is not defined.'
  );
}
const jsonString = Buffer.from(
  process.env.FIREBASE_SERVICE_ACCOUNT,
  'base64'
).toString('utf8');
const firebaseConfig = JSON.parse(jsonString);

export default {
  mongoUri,
  port: process.env.PORT || 3005,
  jwtSecret: process.env.JWT_SECRET || 'field4you',
  firebaseConfig,
};
