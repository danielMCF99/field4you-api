import express, { Request, Response } from 'express';
import ProxyService from '../services/proxyService';
import { logger } from '../logging/logger';

const router = express.Router();

// Proxy route for microservices
router.all('/:serviceName/*', async (req: Request, res: Response) => {
  const { serviceName } = req.params;
  const path = req.params[0]; // Capture the remaining path
  const method = req.method;
  const data = req.body;
  const query = req.query;

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
      }
    );
    res.status(result.status).set(result.headers).json(result.data);
  } catch (error: any) {
    logger.error(
      `Error in route for service '${serviceName}': ${error.message}`
    );
    res.status(500).json({ message: error.message });
  }
});

export default router;
