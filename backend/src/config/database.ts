/**
 * Database Configuration
 */

import type { Knex } from 'knex';

export interface DatabaseConfig {
  client: string;
  connection: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  migrations: {
    directory: string;
  };
  seeds: {
    directory: string;
  };
}

/**
 * Get database configuration based on environment
 */
export function getDatabaseConfig(): DatabaseConfig {
  const env = process.env.NODE_ENV || 'development';
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';
  const database = process.env.DB_NAME || `free_games_${env}`;

  return {
    client: 'postgres',
    connection: {
      host,
      port,
      user,
      password,
      database,
    },
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  };
}

/**
 * Get Knex configuration
 */
export function getKnexConfig(): Knex.Config {
  const dbConfig = getDatabaseConfig();
  return {
    client: dbConfig.client,
    connection: dbConfig.connection,
    migrations: dbConfig.migrations,
    seeds: dbConfig.seeds,
  };
}
