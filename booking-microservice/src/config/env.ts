import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error(
    'The environment variable MONGODB_URI is required but is not defined.'
  );
}

// Configure RabbitMQ
const rabbitmqURL = process.env.RABBITMQ_URL;
if (!rabbitmqURL) {
  throw new Error(
    'The environment variables RABBITMQ_URL is required but is not defined.'
  );
}

const googleProjectId = process.env.GOOGLE_PROJECT_ID;
if (!googleProjectId) {
  throw new Error(
    'The environment variables GOOGLE_PROJECT_ID is required but is not defined.'
  );
}

const googleAppCred = process.env.GOOGLE_APP_CRED;
if (!googleAppCred) {
  throw new Error(
    'The environment variables GOOGLE_APP_CRED is required but is not defined.'
  );
}

export default {
  mongoUri,
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'secret',
  rabbitmqURL,
  googleProjectId,
  googleAppCred,
};
