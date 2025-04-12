import express, { Request, Response } from "express";
import multer from "multer";
import { serviceConfig } from "../config/env";
import { logger } from "../logging/logger";
import ProxyService from "../services/proxyService";

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
      const filteredHeaders = {
        "x-user-id": req.headers["x-user-id"] || "",
        "x-user-email": req.headers["x-user-email"] || "",
        "x-user-type": req.headers["x-user-type"] || "",
        "content-type": req.headers["content-type"] || "application/json",
        authorization: req.headers["authorization"] || "",
      };
      const result = await ProxyService.forwardRequest(
        serviceName,
        path,
        method,
        data,
        query,
        filteredHeaders,
        file
      );

      res.status(result.status).set(result.headers).json(result.data);
    } catch (error: any) {
      logger.error(
        `Error in route for service '${serviceName}': ${error.message}`
      );
      let errorMessage = "An unexpected error occurred";
      let statusCode = 400;
      let details;
      if (error.response) {
        const resData = error.response.data;
        errorMessage = resData?.message || errorMessage;
        statusCode = error.response.status || statusCode;
        details = resData?.details;
      } else if (error.request) {
        errorMessage = "No response from the server";
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
