import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/database.js';
import logger from './config/logger.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';
import authRoutes from './api/auth.js';
import gamesRoutes from './api/games.js';
import analyticsRoutes from './api/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Auth routes (with rate limiting)
app.use('/api/auth', authLimiter, authRoutes);

// Protected routes
app.use('/api/games', authenticate, gamesRoutes);
app.use('/api/analytics', authenticate, analyticsRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  
  try {
    await db.raw('SELECT 1');
    logger.info('✅ Database connected');
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});