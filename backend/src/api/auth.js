import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import db from '../config/database.js';
import logger from '../config/logger.js';
import { authenticate } from '../middleware/auth.js';
import { ValidationError, UnauthorizedError, NotFoundError } from '../utils/errors.js';

const router = express.Router();

function generateToken(user, expiresIn = '15m') {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn }
  );
}

// REGISTER
router.post('/register', async (req, res, next) => {
  try {
    const { email, username, password, confirmPassword } = req.body;

    if (!email || !username || !password) {
      throw new ValidationError('Missing required fields');
    }

    if (password !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    const existing = await db('users').where({ email }).orWhere({ username }).first();
    if (existing) {
      throw new ValidationError('Email or username already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [userId] = await db('users').insert({
      email,
      username,
      password_hash: passwordHash,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const user = await db('users').where({ id: userId }).first();
    const token = generateToken(user);

    logger.info(`✅ User registered: ${email}`);

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user.id, email: user.email, username: user.username },
      accessToken: token,
    });
  } catch (error) {
    next(error);
  }
});

// LOGIN
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password required');
    }

    const user = await db('users').where({ email }).first();
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    if (user.two_factor_enabled) {
      const tempToken = jwt.sign(
        { id: user.id, pending2fa: true },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );
      return res.json({ requiresTwoFactor: true, tempToken });
    }

    const token = generateToken(user);
    logger.info(`✅ User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, username: user.username },
      accessToken: token,
    });
  } catch (error) {
    next(error);
  }
});

// 2FA SETUP
router.post('/2fa/setup', authenticate, async (req, res, next) => {
  try {
    const user = await db('users').where({ id: req.user.id }).first();

    const secret = speakeasy.generateSecret({
      name: `Free Games Claimer (${user.email})`,
      issuer: 'Free Games Claimer',
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    await db('users').where({ id: user.id }).update({ two_factor_secret: secret.base32 });

    logger.info(`🔐 2FA setup initiated: ${user.email}`);

    res.json({ secret: secret.base32, qrCode, backupCodes });
  } catch (error) {
    next(error);
  }
});

// 2FA VERIFY
router.post('/2fa/verify', authenticate, async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await db('users').where({ id: req.user.id }).first();

    if (!user.two_factor_secret) {
      throw new ValidationError('2FA not setup');
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      throw new UnauthorizedError('Invalid 2FA code');
    }

    await db('users').where({ id: user.id }).update({ two_factor_enabled: true });

    logger.info(`✅ 2FA enabled: ${user.email}`);

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    next(error);
  }
});

// 2FA VERIFY LOGIN
router.post('/2fa/verify-login', async (req, res, next) => {
  try {
    const { tempToken, token } = req.body;

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    const user = await db('users').where({ id: decoded.id }).first();

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      throw new UnauthorizedError('Invalid 2FA code');
    }

    const accessToken = generateToken(user);

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, username: user.username },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
});

// PROFILE
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await db('users').where({ id: req.user.id }).first();
    res.json({ user: { id: user.id, email: user.email, username: user.username } });
  } catch (error) {
    next(error);
  }
});

export default router;