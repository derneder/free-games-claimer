/**
 * Backend Configuration
 * Central export point for all configuration
 */

export { getDatabaseConfig, getKnexConfig } from './database';
export type { DatabaseConfig } from './database';

export { getAppConfig } from './app';
export type { AppConfig } from './app';
