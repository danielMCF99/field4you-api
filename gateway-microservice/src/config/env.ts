export const serviceConfig = {
  port: process.env.PORT || 3000,
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:3001/auth",
  users: process.env.USER_SERVICE_URL || "http://localhost:3002/users",
  bookings: process.env.BOOKING_SERVICE_URL || "http://localhost:3003/bookings",
  "sports-venues":
    process.env.SPORTS_VENUE_SERVICE_URL ||
    "http://localhost:3004/sports-venues",
  posts: process.env.FEED_SERVICE_URL || "http://localhost:3005/posts",
};
