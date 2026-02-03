import logger from '../config/logger.js';
import epicGamesWorker from './epicGamesWorker.js';
import gogWorker from './gogWorker.js';
import steamWorker from './steamWorker.js';
import primeGamingWorker from './primeGamingWorker.js';

class JobQueue {
  constructor() {
    this.jobs = [];
    this.isRunning = false;
    this.checkInterval = null;
  }

  /**
   * Register a scheduled job
   * @param {string} name - Job name
   * @param {Function} handler - Job handler function
   * @param {number} intervalMs - Interval in milliseconds
   */
  registerJob(name, handler, intervalMs = 60000) {
    this.jobs.push({
      name,
      handler,
      intervalMs,
      lastRun: 0,
      nextRun: Date.now() + intervalMs,
      isRunning: false,
      successCount: 0,
      errorCount: 0,
    });

    logger.info(`📋 Job registered: ${name} (${intervalMs / 1000 / 60}min interval)`);
  }

  /**
   * Execute a job
   */
  async executeJob(job) {
    if (job.isRunning) {
      logger.warn(`⏳ Job already running: ${job.name}`);
      return;
    }

    job.isRunning = true;

    try {
      const startTime = Date.now();
      logger.info(`🚀 Running job: ${job.name}`);

      const result = await job.handler();

      const duration = Date.now() - startTime;
      job.lastRun = Date.now();
      job.nextRun = Date.now() + job.intervalMs;
      job.successCount++;

      logger.info(
        `✅ Job completed: ${job.name} (${duration}ms) - Result: ${JSON.stringify(result)}`
      );
    } catch (error) {
      job.errorCount++;
      logger.error(`❌ Job error: ${job.name}`, error.message);
    } finally {
      job.isRunning = false;
    }
  }

  /**
   * Start the job queue
   */
  run() {
    if (this.isRunning) {
      logger.warn('Job queue already running');
      return;
    }

    this.isRunning = true;
    logger.info('\\uD83D\\uDEB2 Job queue started');

    // Run all jobs immediately on startup
    this.jobs.forEach((job) => {
      this.executeJob(job);
    });

    // Check every minute which jobs need to run
    this.checkInterval = setInterval(() => {
      const now = Date.now();

      this.jobs.forEach((job) => {
        if (now >= job.nextRun && !job.isRunning) {
          this.executeJob(job);
        }
      });
    }, 60 * 1000); // Check every minute
  }

  /**
   * Stop the job queue
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.isRunning = false;
      logger.info('⛔ Job queue stopped');
    }
  }

  /**
   * Get job status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      jobs: this.jobs.map((j) => ({
        name: j.name,
        isRunning: j.isRunning,
        lastRun: new Date(j.lastRun).toISOString(),
        nextRun: new Date(j.nextRun).toISOString(),
        successCount: j.successCount,
        errorCount: j.errorCount,
      })),
    };
  }
}

// Create singleton instance
const jobQueue = new JobQueue();

// Register workers
// Epic Games: Every 2 hours
jobQueue.registerJob('epic-games', () => epicGamesWorker.getFreeGames(), 2 * 60 * 60 * 1000);

// GOG: Every 3 hours
jobQueue.registerJob('gog-games', () => gogWorker.getFreeGames(), 3 * 60 * 60 * 1000);

// Steam: Every 4 hours
jobQueue.registerJob('steam-games', () => steamWorker.getFreeGames(), 4 * 60 * 60 * 1000);

// Prime Gaming: Every 1 day
jobQueue.registerJob('prime-gaming', () => primeGamingWorker.getFreeGames(), 24 * 60 * 60 * 1000);

export { jobQueue, JobQueue };
export default jobQueue;
