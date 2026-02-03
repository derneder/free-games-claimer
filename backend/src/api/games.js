import express from 'express';
import db from '../config/database.js';
import logger from '../config/logger.js';
import { authenticate } from '../middleware/auth.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

const router = express.Router();

// GET ALL GAMES
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, source } = req.query;
    const offset = (page - 1) * limit;

    let query = db('games').where({ user_id: req.user.id });
    if (source) query = query.where({ source });

    const games = await query.orderBy('obtained_at', 'desc').limit(limit).offset(offset);
    const [{ count }] = await query.clone().count('* as count');

    res.json({
      games,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET SINGLE GAME
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const game = await db('games').where({ id: req.params.id, user_id: req.user.id }).first();
    if (!game) throw new NotFoundError('Game not found');
    res.json({ game });
  } catch (error) {
    next(error);
  }
});

// ADD GAME
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { title, source, sourceUrl, platform, steamPrice } = req.body;

    if (!title || !source) {
      throw new ValidationError('Title and source required');
    }

    const [id] = await db('games').insert({
      user_id: req.user.id,
      title,
      source,
      source_url: sourceUrl,
      platform: platform || 'windows',
      steam_price_usd: steamPrice,
      obtained_at: new Date(),
      created_at: new Date(),
    });

    const game = await db('games').where({ id }).first();
    logger.info(`✅ Game added: ${title}`);

    res.status(201).json({ message: 'Game added', game });
  } catch (error) {
    next(error);
  }
});

// BULK IMPORT
router.post('/import/bulk', authenticate, async (req, res, next) => {
  try {
    const { games } = req.body;

    if (!Array.isArray(games)) {
      throw new ValidationError('Games must be an array');
    }

    const gamesToInsert = games.map((g) => ({
      user_id: req.user.id,
      title: g.title,
      source: g.source,
      source_url: g.sourceUrl,
      platform: g.platform || 'windows',
      steam_price_usd: g.steamPrice,
      obtained_at: new Date(),
      created_at: new Date(),
    }));

    const ids = await db('games').insert(gamesToInsert).onConflict().ignore();

    logger.info(`✅ Imported ${ids.length} games`);

    res.status(201).json({ message: `Imported ${ids.length} games`, count: ids.length });
  } catch (error) {
    next(error);
  }
});

// DELETE GAME
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const game = await db('games').where({ id: req.params.id, user_id: req.user.id }).first();
    if (!game) throw new NotFoundError('Game not found');

    await db('games').where({ id: req.params.id }).delete();
    logger.info(`✅ Game deleted: ${game.title}`);

    res.json({ message: 'Game deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;