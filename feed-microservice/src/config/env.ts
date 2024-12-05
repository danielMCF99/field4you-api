import dotenv from 'dotenv';

dotenv.config();

// Configure database properties
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error(
    'The environment variable MONGODB_URI is required but is not defined.'
  );
}

const firebaseConfig = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
    ? process.env.FIREBASE_SERVICE_ACCOUNT
    : '{}'
);
if (!firebaseConfig) {
  throw new Error(
    'The environment variable FIREBASE_SERVICE_ACCOUNT is required but is not defined.'
  );
}

export default {
  mongoUri,
  port: process.env.PORT || 3005,
  firebaseConfig,
};
