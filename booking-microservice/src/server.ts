import config from "./config/env";
import { connectDB } from "./infrastructure/database/database";
import app from "./app";
import {
  subscribeSportsVenueCreation,
  subscribeUserCreation,
} from "./infrastructure/middlewares/rabbitmq.subscriber";

const startServer = async () => {
  try {
    await connectDB();
    subscribeUserCreation();
    subscribeSportsVenueCreation();
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1);
  }
};

startServer();
