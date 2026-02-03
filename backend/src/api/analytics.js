import express from 'express';
import db from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// STATS
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [{ totalGames }] = await db('games').where({ user_id: userId }).count('* as totalGames');
    const [{ totalValue }] = await db('games').where({ user_id: userId }).sum('steam_price_usd as totalValue');

    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [{ thisMonth }] = await db('games')
      .where({ user_id: userId })
      .whereRaw('obtained_at >= ?', [monthAgo])
      .count('* as thisMonth');

    res.json({
      totalGames: totalGames || 0,
      totalValue: totalValue || 0,
      thisMonth: thisMonth || 0,
    });
  } catch (error) {
    next(error);
  }
});

// DISTRIBUTION
router.get('/distribution', authenticate, async (req, res, next) => {
  try {
    const distribution = await db('games')
      .where({ user_id: req.user.id })
      .select('source')
      .count('* as count')
      .groupBy('source');

    res.json({ distribution });
  } catch (error) {
    next(error);
  }
});

// ACTIVITY
router.get('/activity', authenticate, async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    let daysBack = 30;

    if (period === 'week') daysBack = 7;
    else if (period === 'year') daysBack = 365;

    const dateFilter = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    const activity = await db('games')
      .where({ user_id: req.user.id })
      .whereRaw('obtained_at >= ?', [dateFilter])
      .select(db.raw('DATE(obtained_at) as date'))
      .count('* as count')
      .groupByRaw('DATE(obtained_at)')
      .orderByRaw('DATE(obtained_at)');

    res.json({ activity });
  } catch (error) {
    next(error);
  }
});

export default router;