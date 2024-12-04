import express, { Application } from 'express';
import { serviceConfig } from './config/env';
import routes from './routes/routes';
import { logger } from './logging/logger';

const app: Application = express();

const startServer = async () => {
  try {
    // Middleware
    app.use(express.json());
    app.use((req, res, next) => {
      logger.info(`Incoming request: ${req.method} ${req.url}`);
      next();
    });

    // Routes
    app.use('/api', routes);

    // Error handling
    app.use((err: any, req: any, res: any, next: any) => {
      logger.error(`Unhandled error: ${err.message}`);
      res.status(err.code).json({ error: 'Internal Server Error' });
    });

    // Start server
    app.listen(serviceConfig.port, () => {
      logger.info(`API Gateway running on port ${serviceConfig.port}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};

startServer();
