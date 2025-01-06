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

// Configure properties related to user-microservice
const userGatewayServiceUri = process.env.USER_GATEWAY_SERVICE_URL;
if (!userGatewayServiceUri) {
  throw new Error(
    'The environment variables USER_GATEWAY_SERVICE_URL is required but is not defined.'
  );
}

export default {
  mongoUri,
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'secret',
  mailAccount,
  mailPassword,
  userGatewayServiceUri,
};
