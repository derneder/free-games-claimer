import request from 'supertest';
import app from '../src/index.js';
import db from '../src/config/database.js';

describe('Auth API', () => {
  afterEach(async () => {
    // Очистка БД после каждого теста
    await db('users').truncate();
  });

  describe('POST /api/auth/register', () => {
    test('Should register new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    test('Should fail on duplicate email', async () => {
      // Первая регистрация
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'user1',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      // Вторая с тем же email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'user2',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already exists');
    });

    test('Should fail on duplicate username', async () => {
      // Первая регистрация
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test1@example.com',
          username: 'sameuser',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      // Вторая с тем же username
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test2@example.com',
          username: 'sameuser',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already exists');
    });

    test('Should fail on weak password (< 8 chars)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'weak',
          confirmPassword: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('8 characters');
    });

    test('Should fail on password mismatch', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Password123!',
          confirmPassword: 'DifferentPassword123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('do not match');
    });

    test('Should fail on missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          // Missing username and password
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    test('Should fail on invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'not-an-email',
          username: 'testuser',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('email');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });
    });

    test('Should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.username).toBe('testuser');
    });

    test('Should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid');
    });

    test('Should fail with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid');
    });

    test('Should fail on missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          // Missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });
  });

  describe('POST /api/auth/2fa/setup', () => {
    let token;

    beforeEach(async () => {
      const registerResp = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      token = registerResp.body.accessToken;
    });

    test('Should generate 2FA secret', async () => {
      const response = await request(app)
        .post('/api/auth/2fa/setup')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.secret).toBeDefined();
      expect(response.body.qrCode).toBeDefined();
      expect(response.body.backupCodes).toBeDefined();
      expect(Array.isArray(response.body.backupCodes)).toBe(true);
      expect(response.body.backupCodes.length).toBe(10);
    });

    test('Should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/2fa/setup');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      const registerResp = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      refreshToken = registerResp.body.refreshToken;
    });

    test('Should refresh access token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.accessToken).not.toBe(refreshToken);
    });

    test('Should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;

    beforeEach(async () => {
      const registerResp = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      token = registerResp.body.accessToken;
    });

    test('Should get user profile', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.id).toBeDefined();
    });

    test('Should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
    });

    test('Should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
