import app from './app';
import config from './config/env';
import { connectDB } from './infrastructure/database/database';
import {
  subscribeSportsVenueEvents,
  subscribeUserEvents,
} from './infrastructure/rabbitmq/rabbitmq.subscriber';
import { startLoggingJob } from './infrastructure/utils/job';

const startServer = async () => {
  try {
    await connectDB();

    startLoggingJob();

    // Subscribe queues
    await subscribeUserEvents();
    await subscribeSportsVenueEvents();

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};

startServer();
