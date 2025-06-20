// Load environment variables
import app from './app';
import config from './config/env';
import { connectToDB } from './infrastructure/database/database';
import { subscribeUserEvents } from './infrastructure/rabbitmq/rabbitmq.subscriber';

const startServer = async () => {
  try {
    await connectToDB();
    await subscribeUserEvents();
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};

startServer();
