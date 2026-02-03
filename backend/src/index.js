/**
 * Free Games Claimer - Backend Entry Point
 *
 * Initializes Express application, sets up middleware,
 * connects to databases, and starts the HTTP server.
 *
 * @module src/index
 */

import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import { logger } from './config/logger.js';
import { initializeDatabase } from './config/database.js';
import { initializeRedis } from './config/redis.js';
import { globalErrorHandler } from './middleware/error.js';

// Import routes
import authRoutes from './routes/auth.js';
import gamesRoutes from './routes/games.js';
import usersRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';

const app = express();

/**
 * Middleware Stack
 * Order matters - security middleware first
 */

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// Compression
app.use(compression());

// Request logging
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Free Games Claimer API',
    version: '1.0.0',
    env: config.nodeEnv,
    docs: '/api-docs',
  });
});

/**
 * API Routes
 */
const apiPrefix = config.api.prefix;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/games`, gamesRoutes);
app.use(`${apiPrefix}/users`, usersRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

/**
 * Global Error Handler
 */
app.use(globalErrorHandler);

/**
 * Initialize application and start server
 */
async function startServer() {
  try {
    // Connect to PostgreSQL
    await initializeDatabase();
    logger.info('✓ Database connected');

    // Connect to Redis
    await initializeRedis();
    logger.info('✓ Redis connected');

    // Start listening
    const server = app.listen(config.port, config.host, () => {
      logger.info(
        `🚀 Server running at http://${config.host}:${config.port} [${config.nodeEnv}]`,
      );
      logger.info(`📚 API Documentation: http://${config.host}:${config.port}/api-docs`);
      logger.info(`API Prefix: ${apiPrefix}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
