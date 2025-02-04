import dotenv from 'dotenv';

dotenv.config();

// Configure database properties
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

export default {
  mongoUri,
  port: process.env.PORT || 3002,
  jwtSecret: process.env.JWT_SECRET || 'secret',
  rabbitmqURL,
};
