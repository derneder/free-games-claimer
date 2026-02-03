# Backend Testing Guide

This document describes how to run and maintain tests for the Free Games Claimer backend.

## Test Database Setup

The backend tests use a PostgreSQL database and Redis cache. Tests are configured to automatically reset the database state before each test to prevent data pollution between tests.

### Prerequisites

1. **PostgreSQL** - Required for database operations
   - Default test configuration: `localhost:5432`
   - Database: `postgres`
   - Username: `postgres`
   - Password: `postgres`

2. **Redis** - Required for caching and session management
   - Default test configuration: `localhost:6379`

### Environment Configuration

Test environment variables are configured in `.env.test`. The test setup automatically:
- Loads `.env.test` when `NODE_ENV=test`
- Truncates all database tables before each test
- Clears the Redis cache before each test
- Ensures each test starts with a clean state

## Running Tests Locally

### Install Dependencies

```bash
npm install
```

### Run Database Migrations

Before running tests for the first time, ensure the database schema is set up:

```bash
NODE_ENV=test npm run migrate:all
```

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

## Test Structure

Tests are organized in the `/tests` directory:

```
tests/
├── setup.js              # Global test setup and database reset
├── auth.test.js          # Authentication API tests
└── unit/
    ├── crypto.test.js    # Cryptography utilities tests
    └── validators.test.js # Validation utilities tests
```

### Test Setup (`tests/setup.js`)

The setup file:
1. Initializes database and Redis connections before all tests
2. **Resets database state before each test** to prevent data pollution
3. Clears Redis cache before each test
4. Closes all connections after all tests complete

This ensures that:
- Each test runs in isolation
- No test data leaks between tests
- Registration tests always see a fresh database
- Duplicate user checks work correctly

## Database Reset Mechanism

The `beforeEach` hook in `tests/setup.js` truncates all tables in the correct order to respect foreign key constraints:

```javascript
beforeEach(async () => {
  // Truncate all tables (PostgreSQL converts unquoted identifiers to lowercase)
  await query('TRUNCATE TABLE notifications RESTART IDENTITY CASCADE');
  await query('TRUNCATE TABLE refreshtokens RESTART IDENTITY CASCADE');
  await query('TRUNCATE TABLE activitylogs RESTART IDENTITY CASCADE');
  await query('TRUNCATE TABLE games RESTART IDENTITY CASCADE');
  await query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');

  // Clear Redis cache
  const redis = getRedisClient();
  if (redis && redis.isOpen) {
    await redis.flushDb();
  }
});
```

## Other Commands

### Linting

```bash
npm run lint
```

### Format Check

```bash
npm run format:check
```

### Type Check

```bash
npm run type-check
```

## CI/CD Pipeline

The CI pipeline runs the following commands in order:

1. `npm run lint` - ESLint checks
2. `npm run format:check` - Prettier formatting checks
3. `npm run type-check` - TypeScript type checks
4. `npm run migrate:all` - Database migrations
5. `npm run test:coverage` - Jest tests with coverage

All commands must pass for the build to succeed.

## Coverage Thresholds

Current coverage thresholds are configured in `jest.config.cjs`:

- Statements: 32%
- Branches: 23%
- Functions: 40%
- Lines: 32%

These thresholds reflect the current test coverage and will be increased as more tests are added.

## Troubleshooting

### Tests Fail with "relation does not exist"

Ensure database migrations have been run:
```bash
NODE_ENV=test npm run migrate:all
```

### Tests Fail with Database Connection Errors

Ensure PostgreSQL is running and accessible:
```bash
docker run -d --name test-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15-alpine
```

### Tests Fail with Redis Connection Errors

Ensure Redis is running:
```bash
docker run -d --name test-redis -p 6379:6379 redis:7-alpine
```

### Tests Intermittently Fail with "User already exists"

This was an issue caused by test data pollution. It has been fixed by implementing database reset in `beforeEach`. If you still see this:
1. Ensure you're using the latest version of `tests/setup.js`
2. Verify that database truncation is working properly
3. Check that no tests are creating data outside the test transaction

## Best Practices

1. **Keep tests isolated** - Each test should be independent and not rely on the state from other tests
2. **Use beforeEach for setup** - Common test data should be created in `beforeEach` hooks
3. **Clean up after tests** - The global `beforeEach` handles database cleanup automatically
4. **Mock external services** - Tests should not make real HTTP calls to external APIs
5. **Test error cases** - Include tests for both success and failure scenarios

## Adding New Tests

When adding new tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Test both success and error cases
4. Don't manually clean up the database - the global `beforeEach` handles it
5. Update this documentation if adding new test categories

Example test structure:

```javascript
import request from 'supertest';
import app from '../src/index.js';

describe('New Feature API', () => {
  describe('POST /api/feature', () => {
    test('Should create new feature', async () => {
      const response = await request(app)
        .post('/api/feature')
        .send({ name: 'test' });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('test');
    });

    test('Should fail with invalid data', async () => {
      const response = await request(app)
        .post('/api/feature')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });
});
```
