import express, { Request, Response } from 'express';
import multer from 'multer';
import { io } from '../app';
import { serviceConfig } from '../config/env';
import { logger } from '../logging/logger';
import ProxyService from '../services/proxyService';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post(
  '/auth/register',
  upload.none(), // Se o registo não inclui ficheiros, senão usa .fields
  async (req: Request, res: Response) => {
    const method = req.method;
    const data = req.body;
    const query = req.query;

    try {
      const filteredHeaders = {
        'content-type': req.headers['content-type'],
        authorization: req.headers['authorization'],
      };

      // Faz o forward para o auth-service
      const result = await ProxyService.forwardRequest(
        'auth',
        'register',
        method,
        data,
        query,
        filteredHeaders
      );

      // Se registo OK, emite notificação via websocket
      if (result.status === 200) {
        io.emit('user_registered', {});
      }

      res.status(result.status).set(result.headers).json(result.data);
    } catch (error: any) {
      logger.error(`Error in /auth/register: ${error.message}`);
      res.status(500).json({ message: 'Failed to register user' });
    }
  }
);

// Proxy route for microservices
router.all(
  '/:serviceName/:path(*)?',
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 5 },
  ]),
  async (req: Request, res: Response) => {
    const { serviceName } = req.params as {
      serviceName: keyof typeof serviceConfig;
    };
    const path = req.params['path']; // Capture the remaining path
    const method = req.method;
    const data = req.body;
    const query = req.query;
    const files = req.files;

    // Validate serviceName
    if (!serviceConfig[serviceName]) {
      logger.error(`Service '${serviceName}' is not configured.`);
      res
        .status(400)
        .json({ message: `Service '${serviceName}' is not configured.` });
      return;
    }

    try {
      const filteredHeaders = {
        'x-user-id': req.headers['x-user-id'],
        'x-user-email': req.headers['x-user-email'],
        'x-user-type': req.headers['x-user-type'],
        'content-type': req.headers['content-type'],
        authorization: req.headers['authorization'],
      };

      const result = await ProxyService.forwardRequest(
        serviceName,
        path,
        method,
        data,
        query,
        filteredHeaders,
        files
      );

      res.status(result.status).set(result.headers).json(result.data);
    } catch (error: any) {
      logger.error(
        `Error in route for service '${serviceName}': ${error.message}`
      );
      let errorMessage = 'An unexpected error occurred';
      let statusCode = 400;
      let details;
      if (error.response) {
        const resData = error.response.data;
        errorMessage = resData?.message || errorMessage;
        statusCode = error.response.status || statusCode;
        details = resData?.details;
      } else if (error.request) {
        errorMessage = 'No response from the server';
        statusCode = 503;
      } else {
        errorMessage = error.message;
      }

      const errorResponse: any = { message: errorMessage };
      if (details) {
        errorResponse.details = details;
      }

      res.status(statusCode).json(errorResponse);
    }
  }
);

export default router;
