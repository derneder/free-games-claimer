/**
 * Application Configuration
 */

export interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  host: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  jwtSecret: string;
  jwtExpiry: string;
  corsOrigin: string | string[];
  apiPrefix: string;
}

/**
 * Get application configuration
 */
export function getAppConfig(): AppConfig {
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || 'localhost';
  const logLevel = (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error';
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  const jwtExpiry = process.env.JWT_EXPIRY || '24h';
  const apiPrefix = process.env.API_PREFIX || '/api/v1';

  // CORS configuration
  let corsOrigin: string | string[] = 'http://localhost:3000';
  if (process.env.CORS_ORIGIN) {
    corsOrigin = process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
  }
  if (nodeEnv === 'production') {
    corsOrigin = process.env.CORS_ORIGIN || 'https://example.com';
  }

  return {
    nodeEnv,
    port,
    host,
    logLevel,
    jwtSecret,
    jwtExpiry,
    corsOrigin,
    apiPrefix,
  };
}

/**
 * Application configuration (singleton)
 */
export const appConfig = getAppConfig();
