import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import { logger } from '../logging/logger';
import { serviceConfig } from '../config/env';

class ProxyService {
  static async forwardRequest(
    serviceName: string,
    path: string,
    method: string,
    data?: any,
    file?: any,
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
        headers,
        data,
      };

      /*if (file) {
        const formData = new FormData();
        // Append the file buffer to the form data
        formData.append('image', file.buffer, {
          filename: file.originalname, // The original file name
          contentType: file.mimetype, // The mime type of the file
        });

        // Send request to create equivalent user in user-microservice
        await axios
          .post(serviceConfig.posts + '/create', formData, {
            headers: { ...headers, ...formData.getHeaders() },
          })
          .then((response) => {
            return {
              status: response.status,
              headers: response.headers,
              data: response.data,
            };
          })
          .catch((error) => {
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
          });
      }*/

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
