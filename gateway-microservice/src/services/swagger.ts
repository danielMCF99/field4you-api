import axios from 'axios';
import { serviceConfig } from '../config/env';

const field4YouSwagger: any = {
  openapi: '3.0.0',
  info: {
    title: 'Field4You API Documentation',
    version: '1.0.0',
    description: 'Aggregated API documentation for all services',
  },
  paths: {},
  components: {},
};

const swaggerEndpoints = [
  `${serviceConfig.auth}/swagger`,
  `${serviceConfig.users}/swagger`,
  `${serviceConfig.posts}/swagger`,
  `${serviceConfig.bookings}/swagger`,
  `${serviceConfig['sports-venues']}/swagger`,
];

export const generateSwaggerDocument = async () => {
  const swaggerDocs = await Promise.all(
    swaggerEndpoints.map(async (url) => {
      try {
        const response = await axios.get(url);
        return response.data;
      } catch (error: any) {
        console.error(`Failed to fetch Swagger from ${url}:`, error.message);
        return null;
      }
    })
  );

  swaggerDocs.forEach((doc) => {
    if (doc) {
      Object.assign(field4YouSwagger.paths, doc.paths);

      // Merge components (schemas, responses, etc.)
      if (doc.components) {
        Object.keys(doc.components).forEach((key) => {
          field4YouSwagger.components[key] = {
            ...field4YouSwagger.components[key],
            ...doc.components[key],
          };
        });
      }
    }
  });
  return field4YouSwagger;
};
