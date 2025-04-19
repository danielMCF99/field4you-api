import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import CircuitBreaker from 'opossum';
import { serviceConfig } from '../config/env';
import { logger } from '../logging/logger';

interface ProxyResponse {
  status: number;
  headers: Record<string, any>;
  data: any;
}

class ProxyService {
  static circuitOptions = {
    timeout: 3000,
    errorThresholdPercentage: 90,
    resetTimeout: 1000,
  };

  static breakers: Record<string, CircuitBreaker<any, ProxyResponse>> = {};

  static getBreaker(serviceName: string): CircuitBreaker<any, ProxyResponse> {
    if (!this.breakers[serviceName]) {
      this.breakers[serviceName] = new CircuitBreaker(
        async (config: AxiosRequestConfig) =>
          axios(config).then((res) => ({
            status: res.status,
            headers: res.headers,
            data: res.data,
          })),
        this.circuitOptions
      );

      this.breakers[serviceName].on('open', () =>
        logger.warn(`Circuit for ${serviceName} is open`)
      );
      this.breakers[serviceName].on('close', () =>
        logger.info(`Circuit for ${serviceName} is closed`)
      );
      this.breakers[serviceName].on('halfOpen', () =>
        logger.info(`Circuit for ${serviceName} is half-open`)
      );
      this.breakers[serviceName].on('fallback', () =>
        logger.info(`Fallback triggered for ${serviceName}`)
      );

      /*this.breakers[serviceName].fallback(() => ({
        status: 503,
        headers: {},
        data: { message: "Service temporarily unavailable" },
      }));*/
    }
    return this.breakers[serviceName];
  }

  static async forwardRequest(
    serviceName: string,
    path: string,
    method: string,
    data?: any,
    query?: any,
    headers?: Record<string, any>,
    file?: any
  ): Promise<ProxyResponse> {
    const baseUrl = serviceConfig[serviceName as keyof typeof serviceConfig];

    if (!baseUrl) {
      logger.error(`Service '${serviceName}' is not configured.`);
      throw new Error(`Service '${serviceName}' is not configured.`);
    }

    if (file) {
      const formData = new FormData();
      formData.append('image', file.buffer, file.originalname);
      data = formData;
      headers = {
        ...headers,
        ...formData.getHeaders(),
      };
    }

    if (typeof baseUrl !== 'string') {
      throw new Error(`Invalid baseUrl type: ${typeof baseUrl}`);
    }

    let url;
    if (!path) {
      url = `${baseUrl}`;
    } else {
      url = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    }
    console.log(url);
    //const url = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    const config: AxiosRequestConfig = {
      method: method as AxiosRequestConfig['method'],
      url,
      params: query,
      headers,
      data,
    };

    try {
      logger.info(`Forwarding ${method} request to ${url}`);

      const breaker = ProxyService.getBreaker(serviceName);
      if (breaker.opened) {
        logger.warn(`Circuit for ${serviceName} is open, rejecting request`);
        throw new Error('Breaker is open');
      }

      const response = await breaker.fire(config);
      return {
        status: response.status,
        headers: response.headers,
        data: response.data,
      };
    } catch (error: any) {
      logger.error(
        `Error while forwarding request to service '${serviceName}': ${error.message}`
      );

      if (error.code === 'ETIMEDOUT' || error.message?.includes('Timed out')) {
        throw new Error('Request to service timed out.');
      }

      if (error.message?.includes('Breaker is open')) {
        // Return a standard response for service unavailable
        return {
          status: 503,
          headers: {},
          data: { message: 'Service temporarily unavailable' },
        };
      }

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
