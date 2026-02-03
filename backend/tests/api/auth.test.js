import request from 'supertest';
import app from '../../src/index.js';
import db from '../../src/config/database.js';
import jwt from 'jsonwebtoken';

describe('Authentication API', () => {
  // Clean database before each test
  beforeEach(async () => {
    await db('users').del();
  });

  // Clean up after all tests
  afterAll(async () => {
    await db.destroy();
  });

  // ============ REGISTER TESTS ============
  describe('POST /api/auth/register', () => {
    it('should register new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Test1234',
          confirmPassword: 'Test1234'
        });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.username).toBe('testuser');
      expect(res.body.accessToken).toBeDefined();
    });

    it('should fail with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'Test1234',
          confirmPassword: 'Test1234'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    it('should fail with weak password (less than 8 chars)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: '123',
          confirmPassword: '123'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('8 characters');
    });

    it('should fail with mismatched passwords', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Test1234',
          confirmPassword: 'Different1234'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('not match');
    });

    it('should fail with duplicate email', async () => {
      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'user1',
          password: 'Test1234',
          confirmPassword: 'Test1234'
        });

      // Try to create with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'user2',
          password: 'Test1234',
          confirmPassword: 'Test1234'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('already exists');
    });
  });

  // ============ LOGIN TESTS ============
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Test1234',
          confirmPassword: 'Test1234'
        });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test1234'
        });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.accessToken).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid');
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test1234'
        });

      expect(res.status).toBe(401);
    });

    it('should fail with missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  // ============ REFRESH TOKEN TESTS ============
  describe('POST /api/auth/refresh', () => {
    let accessToken;
    let refreshToken;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Test1234',
          confirmPassword: 'Test1234'
        });

      accessToken = res.body.accessToken;
      // Create a refresh token manually for testing
      const user = await db('users').where({ email: 'test@example.com' }).first();
      refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );
    });

    it('should refresh token with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.accessToken).not.toBe(accessToken);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(401);
    });
  });

  // ============ CHANGE PASSWORD TESTS ============
  describe('POST /api/auth/change-password', () => {
    let accessToken;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Test1234',
          confirmPassword: 'Test1234'
        });

      accessToken = res.body.accessToken;
    });

    it('should change password with correct current password', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'Test1234',
          newPassword: 'NewPass1234',
          confirmPassword: 'NewPass1234'
        });

      expect(res.status).toBe(200);
    });

    it('should fail with incorrect current password', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPass1234',
          confirmPassword: 'NewPass1234'
        });

      expect(res.status).toBe(401);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'Test1234',
          newPassword: 'NewPass1234',
          confirmPassword: 'NewPass1234'
        });

      expect(res.status).toBe(401);
    });
  });

  // ============ PROFILE TESTS ============
  describe('GET /api/auth/profile', () => {
    let accessToken;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Test1234',
          confirmPassword: 'Test1234'
        });

      accessToken = res.body.accessToken;
    });

    it('should get profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.username).toBe('testuser');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/auth/profile');

      expect(res.status).toBe(401);
    });
  });
});
