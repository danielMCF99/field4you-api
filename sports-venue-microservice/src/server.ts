import app from './app';
import config from './config/env';
import { connectDB } from './infrastructure/database/database';
import { subscribeUserEvents } from './infrastructure/middlewares/rabbitmq.subscriber';

const startServer = async () => {
  try {
    await connectDB();
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
