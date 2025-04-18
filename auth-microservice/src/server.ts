// Load environment variables
import config from "./config/env";
import { connectToDB } from "./infrastructure/database/database";
import app from "./app";
import {
  subscribeUserDeletion,
  subscribeUserUpdate,
} from "./infrastructure/middlewares/rabbitmq.subscriber";

const startServer = async () => {
  try {
    await connectToDB();

    // Subscribe queues
    await subscribeUserDeletion();
    await subscribeUserUpdate();

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1);
  }
};

startServer();
