import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error(
    "The environment variable MONGODB_URI is required but is not defined."
  );
}
const sportsVenueGatewayServiceUri = process.env.SPORTS_VENUE_SERVICE_URL;
if (!sportsVenueGatewayServiceUri) {
  throw new Error(
    "The environment variables USER_GATEWAY_SERVICE_URL is required but is not defined."
  );
}
export default {
  mongoUri,
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "secret",
  sportsVenueGatewayServiceUri,
};
