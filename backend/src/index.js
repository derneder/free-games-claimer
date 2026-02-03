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
  })
);

// Compression
app.use(compression());

// Request logging
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Free Games Claimer API',
    version: '1.0.0',
    env: config.nodeEnv,
    docs: '/api-docs',
  });
});

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
        `🚀 Server running at http://${config.host}:${config.port} [${config.nodeEnv}]`
      );
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
