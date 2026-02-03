/**
 * Main Application Entry Point
 * Initializes and starts the Express server
 */

import type { Express, Request, Response, NextFunction } from 'express';
import { appConfig } from '@config/app';
import { logger } from '@utils/logger';
import { errorHandler, notFoundHandler } from '@middleware/index';

/**
 * Application Factory
 */
export function createApp(): Express {
  // TODO: Import Express after installing dependencies
  // import express from 'express';
  // const app = express();

  logger.info('Creating application instance');

  // Placeholder for now
  return {} as Express;
}

/**
 * Configure middleware
 */
function configureMiddleware(app: Express): void {
  logger.debug('Configuring middleware');

  // TODO: Add middleware
  // app.use(express.json());
  // app.use(express.urlencoded({ extended: true }));
  // app.use(cors({ origin: appConfig.corsOrigin }));
  // app.use(morgan('combined'));
}

/**
 * Configure routes
 */
function configureRoutes(app: Express): void {
  logger.debug('Configuring routes');

  // TODO: Add routes
  // app.use(`${appConfig.apiPrefix}/auth`, authRoutes);
  // app.use(`${appConfig.apiPrefix}/users`, userRoutes);
  // app.use(`${appConfig.apiPrefix}/games`, gameRoutes);
}

/**
 * Configure error handlers
 */
function configureErrorHandlers(app: Express): void {
  logger.debug('Configuring error handlers');

  // app.use(notFoundHandler);
  // app.use(errorHandler);
}

/**
 * Start the server
 */
export async function startServer(): Promise<void> {
  try {
    logger.info('Starting server', {
      nodeEnv: appConfig.nodeEnv,
      port: appConfig.port,
      host: appConfig.host,
    });

    const app = createApp();

    configureMiddleware(app);
    configureRoutes(app);
    configureErrorHandlers(app);

    // TODO: Uncomment after implementing full app
    // app.listen(appConfig.port, appConfig.host, () => {
    //   logger.info(`Server running at http://${appConfig.host}:${appConfig.port}`);
    // });

    logger.info('Server configured successfully');
  } catch (error) {
    logger.error('Failed to start server', error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }
}

/**
 * Start server on module load
 */
if (require.main === module) {
  startServer();
}
