import express, { Request, Response } from "express";
import multer from "multer";
import ProxyService from "../services/proxyService";
import { logger } from "../logging/logger";
import { serviceConfig } from "../config/env";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Proxy route for microservices
router.all(
  "/:serviceName/*",
  upload.single("image"),
  async (req: Request, res: Response) => {
    const { serviceName } = req.params as {
      serviceName: keyof typeof serviceConfig;
    };
    const path = req.params[0]; // Capture the remaining path
    const method = req.method;
    const data = req.body;
    const query = req.query;
    const file = req.file;

    // Validate serviceName
    if (!serviceConfig[serviceName]) {
      logger.error(`Service '${serviceName}' is not configured.`);
      res
        .status(400)
        .json({ message: `Service '${serviceName}' is not configured.` });
      return;
    }

    try {
      const authHeader = req.headers["authorization"];

      // Use the Circuit Breaker from ProxyService
      const breaker = ProxyService.getBreaker(serviceName); // Get or create a breaker for the service
      const result = await breaker.fire({
        method,
        url: `${serviceConfig[serviceName]}/${path}`,
        params: query,
        headers: {
          Authorization: authHeader || "",
        },
        data,
      });

      res.status(result.status).set(result.headers).json(result.data);
    } catch (error: any) {
      logger.error(
        `Error in route for service '${serviceName}': ${error.message}`
      );
      var errorMessage = "An unexpected error occurred";
      var statusCode = 400;
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        statusCode = error.response.status || 400;
      } else if (error.request) {
        errorMessage = "No response from the server";
        statusCode = 503;
      } else {
        errorMessage = error.message;
      }
      console.error("Error:", errorMessage);
      res.status(statusCode).json({ message: errorMessage });
    }
  }
);

export default router;
