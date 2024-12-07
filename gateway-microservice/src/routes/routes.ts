import express, { Request, Response } from 'express';
import multer from 'multer';
import ProxyService from '../services/proxyService';
import { logger } from '../logging/logger';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Proxy route for microservices
router.all(
  '/:serviceName/*',
  upload.single('image'),
  async (req: Request, res: Response) => {
    const { serviceName } = req.params;
    const path = req.params[0]; // Capture the remaining path
    const method = req.method;
    const data = req.body;
    const query = req.query;
    const file = req.file;

    try {
      const authHeader = req.headers['authorization'];

      const result = await ProxyService.forwardRequest(
        serviceName,
        `/${path}`,
        method,
        data,
        query,
        {
          Authorization: authHeader || '',
        },
        file
      );
      res.status(result.status).set(result.headers).json(result.data);
    } catch (error: any) {
      logger.error(
        `Error in route for service '${serviceName}': ${error.message}`
      );
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
