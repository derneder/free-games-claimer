import request from 'supertest';
import app from '../src/index.js';
import db from '../src/config/database.js';

describe('Games API', () => {
  let userId, token;

  beforeEach(async () => {
    // Создаем пользователя и логиниться
    const registerResp = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    token = registerResp.body.accessToken;
    userId = registerResp.body.user.id;
  });

  afterEach(async () => {
    await db('games').truncate();
    await db('users').truncate();
  });

  describe('GET /api/games', () => {
    test('Should return empty list for new user', async () => {
      const response = await request(app)
        .get('/api/games')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.games).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
      expect(response.body.pagination.pages).toBe(0);
    });

    test('Should return games with pagination', async () => {
      // Добавляем несколько игр
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post('/api/games')
          .set('Authorization', `Bearer ${token}`)
          .send({
            title: `Game ${i}`,
            source: 'epic',
            sourceUrl: `https://epic.com/game${i}`,
            platform: 'windows',
            steamPrice: i * 10,
          });
      }

      const response = await request(app)
        .get('/api/games?page=1&limit=3')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.games).toHaveLength(3);
      expect(response.body.pagination.total).toBe(5);
      expect(response.body.pagination.pages).toBe(2);
      expect(response.body.pagination.page).toBe(1);
    });

    test('Should filter games by source', async () => {
      // Добавляем игры разных источников
      await request(app)
        .post('/api/games')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Epic Game', source: 'epic' });

      await request(app)
        .post('/api/games')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'GOG Game', source: 'gog' });

      const response = await request(app)
        .get('/api/games?source=epic')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.games).toHaveLength(1);
      expect(response.body.games[0].source).toBe('epic');
    });

    test('Should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/games');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/games/:id', () => {
    test('Should get single game', async () => {
      // Добавляем игру
      const addResp = await request(app)
        .post('/api/games')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Game',
          source: 'epic',
          sourceUrl: 'https://epic.com/game',
          platform: 'windows',
          steamPrice: 29.99,
        });

      const gameId = addResp.body.game.id;

      const response = await request(app)
        .get(`/api/games/${gameId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.game.title).toBe('Test Game');
      expect(response.body.game.source).toBe('epic');
    });

    test('Should fail to get non-existent game', async () => {
      const response = await request(app)
        .get('/api/games/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/games', () => {
    test('Should add game', async () => {
      const response = await request(app)
        .post('/api/games')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Game',
          source: 'epic',
          sourceUrl: 'https://epic.com/game',
          platform: 'windows',
          steamPrice: 29.99,
        });

      expect(response.status).toBe(201);
      expect(response.body.game.title).toBe('Test Game');
      expect(response.body.game.user_id).toBe(userId);
      expect(response.body.game.source).toBe('epic');
    });

    test('Should not add duplicate game', async () => {
      // Добавляем первый раз
      await request(app)
        .post('/api/games')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Game',
          source: 'epic',
        });

      // Пытаемся добавить еще раз
      const response = await request(app)
        .post('/api/games')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Game',
          source: 'epic',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already in library');
    });

    test('Should fail on missing title', async () => {
      const response = await request(app)
        .post('/api/games')
        .set('Authorization', `Bearer ${token}`)
        .send({
          source: 'epic',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/games/:id', () => {
    test('Should delete game', async () => {
      // Добавляем игру
      const addResp = await request(app)
        .post('/api/games')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Game',
          source: 'epic',
        });

      const gameId = addResp.body.game.id;

      // Удаляем
      const response = await request(app)
        .delete(`/api/games/${gameId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      // Проверяем что удалена
      const getResp = await request(app)
        .get(`/api/games/${gameId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getResp.status).toBe(404);
    });
  });

  describe('POST /api/games/import/bulk', () => {
    test('Should import multiple games', async () => {
      const response = await request(app)
        .post('/api/games/import/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          games: [
            { title: 'Game 1', source: 'epic', steamPrice: 10 },
            { title: 'Game 2', source: 'gog', steamPrice: 20 },
            { title: 'Game 3', source: 'steam', steamPrice: 30 },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.count).toBe(3);
      expect(response.body.games).toHaveLength(3);
    });

    test('Should fail on empty array', async () => {
      const response = await request(app)
        .post('/api/games/import/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          games: [],
        });

      expect(response.status).toBe(400);
    });
  });
});