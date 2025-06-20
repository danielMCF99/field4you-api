import express, { Application, NextFunction, Request, Response } from 'express';
import { serve, setup } from 'swagger-ui-express';
import { serviceConfig } from './config/env';
import { JwtHelperImplementation } from './jwt/jwtHelper';
import { logger } from './logging/logger';
import { authenticate } from './middlewares/auth.middleware';
import routes from './routes/routes';
import { generateSwaggerDocument } from './services/swagger';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

export let io: SocketIOServer;
export const jwtHelper = JwtHelperImplementation.getInstance();

const app: Application = express();

const startServer = async () => {
  try {
    // Middleware
    app.use(express.json());

    app.use(
      cors({
        origin: ['http://localhost:5173', 'https://field4you-web.vercel.app'],
        credentials: true,
      })
    );

    app.use(
      '/swagger',
      serve,
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const swaggerDocument = await generateSwaggerDocument();
          return setup(swaggerDocument)(req, res, next);
        } catch (error: any) {
          console.error('Failed to load Swagger UI:', error.message);
          res.status(500).send('Internal Server Error');
        }
      }
    );

    app.use(authenticate);

    // Routes
    app.use('/api', routes);

    // Error handling
    app.use((err: any, req: any, res: any, next: any) => {
      logger.error(`Unhandled error: ${err.message}`);
      res.status(err.code).json({ error: 'Internal Server Error' });
    });

    // Cria o HTTP server e Socket.IO
    const server = http.createServer(app);
    io = new SocketIOServer(server, {
      cors: {
        origin: ['http://localhost:5173', 'https://field4you-web.vercel.app'],
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      logger.info('Admin connected to WebSocket');
      socket.on('disconnect', () => {
        logger.info('Admin disconnected from WebSocket');
      });
    });

    // Start server
    server.listen(serviceConfig.port, () => {
      logger.info(`API Gateway running on port ${serviceConfig.port}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};

startServer();
