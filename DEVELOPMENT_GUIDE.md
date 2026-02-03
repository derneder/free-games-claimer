# 📖 Development Guide - Free Games Claimer

**Status:** Production Ready (90%)  
**Last Updated:** 2026-02-03  

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- PostgreSQL 15+
- Git

### Development Setup

```bash
# Clone repository
git clone https://github.com/derneder/free-games-claimer.git
cd free-games-claimer

# Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start with Docker
docker-compose up

# Or local development
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API: http://localhost:3000/api

---

## 📦 Database Setup

### Run Migrations

```bash
# Inside container
docker-compose exec backend node database/migrate.js all

# Or locally
cd backend && node database/migrate.js migrate
```

### Database Commands

```bash
# Migrations only
node database/migrate.js migrate

# Seed data only
node database/migrate.js seed

# Both
node database/migrate.js all
```

### Database Access

```bash
# Connect to PostgreSQL
psql postgresql://postgres:postgres@localhost:5432/free_games_dev

# View tables
\dt

# View table schema
\d users
```

---

## 🧪 Testing

### Run Tests

```bash
cd backend

# All tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Specific test file
npm test -- auth.test.js
```

### Test Structure

```
backend/tests/
├── setup.js              # Test configuration
├── unit/
│   ├── auth.test.js      # Auth service tests
│   ├── validators.test.js # Validation tests
│   └── crypto.test.js    # Crypto utility tests
└── fixtures/
    ├── users.json        # User test data
    └── games.json        # Game test data
```

---

## 🔍 Linting & Formatting

### Check Code Quality

```bash
cd backend

# Lint code
npm run lint

# Format code
npm run format

# Check formatting
npm run format -- --check
```

### Frontend

```bash
cd frontend

# Lint code
npm run lint

# Format code
npm run format
```

---

## 📝 API Documentation

### Authentication

#### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username",
    "password": "Password123!"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

#### Get Profile
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Games

#### List Games
```bash
curl -X GET "http://localhost:3000/api/games?page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create Game
```bash
curl -X POST http://localhost:3000/api/games \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Game Name",
    "description": "Description",
    "price": 29.99,
    "platforms": ["PC", "PlayStation"],
    "sources": ["Epic Games"]
  }'
```

#### Get Game Statistics
```bash
curl -X GET http://localhost:3000/api/games/stats/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Admin

#### Get System Stats
```bash
curl -X GET http://localhost:3000/api/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

#### Get Users
```bash
curl -X GET "http://localhost:3000/api/admin/users?page=1&pageSize=20" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🐳 Docker Commands

### Development

```bash
# Start all services
docker-compose up

# Start specific service
docker-compose up postgres
docker-compose up backend

# Build and start
docker-compose up --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v
```

### Production

```bash
# Build images
docker build -t free-games-claimer:backend ./backend
docker build -t free-games-claimer:frontend ./frontend

# Deploy
docker-compose -f docker-compose.prod.yml up

# With environment file
docker-compose -f docker-compose.prod.yml --env-file .env.prod up
```

---

## 🔐 Environment Variables

### Backend (.env)

```bash
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/free_games_dev
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=free_games_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES=24h

# 2FA
TOTP_ISSUER=Free Games Claimer

# Server
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Free Games Claimer
VITE_APP_VERSION=1.0.0
```

---

## 📊 Project Structure

### Backend

```
backend/
├── src/
│   ├── config/          # Configuration
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utilities
│   ├── models/          # Data models
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── controllers/     # Request handlers
│   └── index.js         # Entry point
├── database/
│   ├── migrations/      # DB migrations
│   ├── seed.sql         # Seed data
│   └── migrate.js       # Migration runner
├── tests/               # Test files
├── Dockerfile
└── package.json
```

### Frontend

```
frontend/
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── hooks/           # Custom hooks
│   ├── store/           # State management
│   ├── styles/          # Styles
│   ├── App.jsx
│   └── main.jsx
├── public/              # Static files
├── Dockerfile
├── nginx.conf
└── package.json
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Automatically runs on every push/PR:

```
CI Pipeline:
├── Backend Tests
├── Frontend Build
├── Code Quality
├── Security Scan
└── Deploy (on main branch)
```

### View Workflows

```
.github/workflows/
├── ci.yml          # Main CI pipeline
├── security.yml    # Security scanning
└── deploy.yml      # Deployment
```

---

## 🛠️ Common Development Tasks

### Add New API Endpoint

1. Create route in `backend/src/routes/`
2. Create controller in `backend/src/controllers/`
3. Create service in `backend/src/services/`
4. Add tests in `backend/tests/`
5. Update frontend service

### Add New Frontend Component

1. Create component in `frontend/src/components/`
2. Add types (if using TypeScript)
3. Add styles
4. Export from index
5. Use in pages

### Update Database Schema

1. Create new migration file in `backend/database/migrations/`
2. Update seed.sql if needed
3. Run migrations
4. Update models

---

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check if PostgreSQL is running
docker-compose logs postgres

# Verify credentials
docker-compose exec postgres psql -U postgres -c "\l"
```

### Port Already in Use

```bash
# Find process on port
lsof -i :3000
lsof -i :5173
lsof -i :5432

# Kill process
kill -9 <PID>
```

### Docker Issues

```bash
# Clean up Docker
docker-compose down -v
docker system prune

# Rebuild from scratch
docker-compose up --build
```

### Test Failures

```bash
# Check test setup
cat backend/.env.test

# Run with debug
DEBUG=* npm test

# Run specific test
npm test -- --testNamePattern="test name"
```

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes
3. Run tests: `npm test`
4. Lint code: `npm run lint`
5. Commit: `git commit -m "feat: description"`
6. Push: `git push origin feature/name`
7. Create Pull Request

---

## 📞 Support

For questions or issues:
- Check documentation files
- Review test files for examples
- Check GitHub issues
- Review code comments

---

**Happy coding! 🚀**
