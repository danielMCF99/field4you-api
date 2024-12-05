//import dotenv from 'dotenv';

//dotenv.config();

export const serviceConfig = {
  port: process.env.PORT || 3000,
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  users: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  bookings: process.env.BOOKING_SERVICE_URL || 'http://localhost:3003',
  'sports-venues':
    process.env.SPORTS_VENUE_SERVICE_URL || 'http://localhost:3004',
  posts: process.env.FEED_SERVICE_URL || 'http://localhost:3005',
};
