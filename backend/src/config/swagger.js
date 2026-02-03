import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import logger from './logger.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Free Games Claimer API',
      version: '1.0.0',
      description: 'API для сбора бесплатных игр с Epic Games, GOG, Steam, Prime Gaming',
      contact: {
        name: 'Derneder',
        url: 'https://github.com/derneder',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: process.env.API_URL || 'https://api.freegamesclaimer.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme',
        },
        csrfToken: {
          type: 'apiKey',
          in: 'header',
          name: 'X-CSRF-Token',
          description: 'CSRF Token for POST requests',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            is_active: { type: 'boolean' },
            two_factor_enabled: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Game: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            source: { type: 'string', enum: ['epic', 'gog', 'steam', 'prime'] },
            platform: { type: 'string', enum: ['windows', 'mac', 'linux'] },
            steam_price_usd: { type: 'number' },
            obtained_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            status: { type: 'integer' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Games', description: 'Game management endpoints' },
      { name: 'Analytics', description: 'Analytics and statistics' },
      { name: 'Admin', description: 'Admin panel endpoints' },
    ],
  },
  apis: ['./src/api/*.js'],
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve);
  app.get(
    '/api-docs',
    swaggerUi.setup(specs, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
      },
    })
  );

  logger.info('📚 Swagger API docs available at http://localhost:3000/api-docs');
}

export default specs;
