import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Free Games Claimer API',
      version: '1.0.0',
      description: 'API для автоматического сбора бесплатных игр с Epic Games, GOG, Steam',
      contact: {
        name: 'Support',
        email: 'support@free-games-claimer.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development Server',
      },
      {
        url: 'https://api.example.com/api',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token without Bearer prefix',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string' },
            username: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            two_factor_enabled: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Game: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            title: { type: 'string' },
            source: { type: 'string', enum: ['epic', 'gog', 'steam', 'prime'] },
            source_url: { type: 'string' },
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
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    './src/api/auth.js',
    './src/api/games.js',
    './src/api/analytics.js',
    './src/api/admin.js',
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true,
      },
      customCss: `
        .topbar { display: none; }
        .swagger-ui .model-box { background-color: #1f2937; }
        .swagger-ui { background-color: #111827; }
      `,
      customSiteTitle: 'Free Games Claimer API Docs',
    })
  );

  // JSON endpoint для tools
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export default setupSwagger;