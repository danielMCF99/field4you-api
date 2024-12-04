import axios, { AxiosRequestConfig } from 'axios';
import { logger } from '../logging/logger';
import { serviceConfig } from '../config/env';

class ProxyService {
  static async forwardRequest(
    serviceName: string,
    path: string,
    method: string,
    data?: any,
    query?: any,
    headers?: Record<string, any>
  ) {
    const baseUrl = serviceConfig[serviceName as keyof typeof serviceConfig];

    if (!baseUrl) {
      logger.error(`Service '${serviceName}' is not configured.`);
      throw new Error(`Service '${serviceName}' is not configured.`);
    }

    try {
      const url = `${baseUrl}${path}`;
      const config: AxiosRequestConfig = {
        method: method as AxiosRequestConfig['method'],
        url,
        params: query,
        data,
        headers,
      };

      logger.info(`Forwarding ${method} request to ${url}`);
      const response = await axios(config);

      //return response.data;
      return {
        status: response.status,
        headers: response.headers,
        data: response.data,
      };
    } catch (error: any) {
      logger.error(
        `Error while forwarding request to service '${serviceName}': ${error.message}`
      );
      if (error.response) {
        return {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data,
        };
      }
      throw new Error('Failed to communicate with the service.');
    }
  }
}

export default ProxyService;
