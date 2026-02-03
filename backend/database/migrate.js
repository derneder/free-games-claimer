/**
 * Database Migration Runner
 *
 * Executes SQL migration files in order.
 *
 * Usage: node database/migrate.js
 */

import dotenv from 'dotenv';
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

// Load environment variables before importing config
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

import { config } from '../src/config/env.js';
import { logger } from '../src/config/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create client configuration supporting both connection string and individual env vars
const clientConfig = config.database.url
  ? { connectionString: config.database.url }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'postgres',
    };

/**
 * Run migrations
 */
async function runMigrations() {
  const client = new pg.Client(clientConfig);
  try {
    await client.connect();
    logger.info('Connected to database');

    // Get migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await readdir(migrationsDir);
    const migrations = files.filter((f) => f.endsWith('.sql')).sort();

    if (migrations.length === 0) {
      logger.warn('No migration files found');
      return;
    }

    // Run each migration
    for (const file of migrations) {
      const filePath = path.join(migrationsDir, file);
      const sql = await readFile(filePath, 'utf-8');

      logger.info(`Running migration: ${file}`);
      await client.query(sql);
      logger.info(`✓ Migration completed: ${file}`);
    }

    logger.info('✓ All migrations completed successfully');
  } catch (error) {
    logger.error('Migration error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

/**
 * Run seeds
 */
async function runSeeds() {
  const client = new pg.Client(clientConfig);
  try {
    await client.connect();
    logger.info('Connected to database for seeding');

    const seedFile = path.join(__dirname, 'seed.sql');
    const sql = await readFile(seedFile, 'utf-8');

    logger.info('Running seed data...');
    await client.query(sql);
    logger.info('✓ Seed data inserted');
  } catch (error) {
    logger.error('Seed error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

/**
 * Main
 */
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'migrate':
      await runMigrations();
      break;
    case 'seed':
      await runSeeds();
      break;
    case 'all':
      await runMigrations();
      await runSeeds();
      break;
    default:
      console.log('Usage: node database/migrate.js [migrate|seed|all]');
      console.log('');
      console.log('Commands:');
      console.log('  migrate  - Run database migrations');
      console.log('  seed     - Run seed data');
      console.log('  all      - Run migrations and seed data');
      process.exit(0);
  }
}

main();
