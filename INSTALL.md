# 🚀 Installation Guide - Free Games Claimer PRO

## Prerequisites

- Node.js 18+
- Docker & Docker Compose (optional but recommended)
- PostgreSQL 16 (or use Docker)
- Redis (or use Docker)

## Option 1: Docker (Recommended)

### 1. Clone Repository
```bash
git clone https://github.com/derneder/free-games-claimer.git
cd free-games-claimer
```

### 2. Setup Environment
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Edit .env files (optional)
```bash
# Get Telegram Bot Token from @BotFather in Telegram
# Edit backend/.env if needed
```

### 4. Start Docker Compose
```bash
docker-compose up -d
```

### 5. Run Migrations
```bash
docker-compose exec backend npm run migrate:latest
```

### 6. Access Application
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000/api
- **API Docs**: http://localhost:3000/api/docs

## Option 2: Local Installation

### 1. Clone Repository
```bash
git clone https://github.com/derneder/free-games-claimer.git
cd free-games-claimer
```

### 2. Setup Database
```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE free_games_claimer;
\q
```

### 3. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run migrate:latest
npm run dev
```

### 4. Frontend Setup (new terminal)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Configuration

### Telegram Bot Setup

1. Open Telegram and search for **@BotFather**
2. Send `/start` and follow instructions
3. Send `/newbot` to create new bot
4. Get your **Bot Token**
5. Add token to `backend/.env`:
   ```
   TELEGRAM_BOT_TOKEN=your_token_here
   ```

### JWT Secret Generation

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy output to `JWT_SECRET` in `.env`

## Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
psql -U postgres -d free_games_claimer

# Reset migrations
npm run migrate:rollback
npm run migrate:latest
```

### Port Already in Use
```bash
# Change port in .env
PORT=3001

# Or kill process
lsof -ti:3000 | xargs kill -9
```

### Redis Connection Error
```bash
# Start Redis
redis-server

# Or with Docker
docker run -d -p 6379:6379 redis:7-alpine
```

## Next Steps

1. Register an account
2. Login with your credentials
3. Setup 2FA (optional but recommended)
4. Click "Run Collection" to start collecting games
5. Connect Telegram bot for notifications

## Support

If you encounter issues:

1. Check logs: `docker-compose logs backend`
2. Open issue: https://github.com/derneder/free-games-claimer/issues
3. Join Discord: (coming soon)

Happy game collecting! 🎮
