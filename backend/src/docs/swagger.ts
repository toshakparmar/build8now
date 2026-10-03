import swaggerJSDoc from 'swagger-jsdoc';
import { env } from '../config/env';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Build8Now API',
      version: '1.0.0',
      description: 'API documentation for Build8Now assignment',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/docs/swagger.yml', './src/routes/*.ts', './src/modules/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);