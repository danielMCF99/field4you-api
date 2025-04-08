import config from './config/env';
import { connectDB } from './infrastructure/database/database';
import app from './app';
import {
  subscribeSportsVenueCreation,
  subscribeUserCreation,
  subscribeSportsVenueDeletion,
  subscribeSportsVenueUpdates,
  subscribeUserDeletion,
} from './infrastructure/middlewares/rabbitmq.subscriber';

const startServer = async () => {
  try {
    await connectDB();

    // Subscribe queues
    await subscribeUserCreation();
    await subscribeUserDeletion();
    await subscribeSportsVenueCreation();
    await subscribeSportsVenueDeletion();
    await subscribeSportsVenueUpdates();

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};

startServer();
