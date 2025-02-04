import dotenv from 'dotenv';

dotenv.config();

// Configure database properties
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error(
    'The environment variable MONGODB_URI is required but is not defined.'
  );
}

// Configure properties for mail regarding password recovery
const mailAccount = process.env.MAIL_ACCOUNT;
const mailPassword = process.env.MAIL_PASSWORD;

if (!mailAccount || !mailPassword) {
  throw new Error(
    'The environment variables MAIL_ACCOUNT and MAIL_PASSWORD are required but are not defined.'
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
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'secret',
  mailAccount,
  mailPassword,
  rabbitmqURL,
};
