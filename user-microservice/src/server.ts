// Load environment variables
import app from './app';
import config from './config/env';
import { connectToDB } from './infrastructure/database/database';
import {
  subscribeUserCreation,
  subscribeUserPushNotificationTokenUpdate,
} from './infrastructure/rabbitmq/rabbitmq.subscriber';

const startServer = async () => {
  try {
    await connectToDB();
    await subscribeUserCreation();
    await subscribeUserPushNotificationTokenUpdate();
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};

startServer();
