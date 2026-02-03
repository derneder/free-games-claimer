/**
 * Swagger/OpenAPI Configuration
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Free Games Claimer API',
      description: 'Track and manage free games from multiple platforms',
      version: '1.0.0',
      contact: {
        name: 'Free Games Claimer',
        url: 'https://github.com/derneder/free-games-claimer',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.example.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'email', 'username', 'role'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 30,
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
            },
            twoFaEnabled: {
              type: 'boolean',
            },
            isActive: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Game: {
          type: 'object',
          required: ['id', 'userId', 'title', 'price'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
              maxLength: 255,
            },
            description: {
              type: 'string',
            },
            price: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
            },
            image: {
              type: 'string',
              format: 'uri',
            },
            platforms: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            sources: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            claimedAt: {
              type: 'string',
              format: 'date-time',
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        ActivityLog: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            action: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            resourceType: {
              type: 'string',
            },
            resourceId: {
              type: 'string',
              format: 'uuid',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            statusCode: {
              type: 'integer',
            },
            message: {
              type: 'string',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
