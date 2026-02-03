# 🚀 Quick Start Guide

## 30 Second Setup with Docker

```bash
# 1. Clone
git clone https://github.com/derneder/free-games-claimer.git
cd free-games-claimer

# 2. Configure (optional)
cp .env.example .env
# Edit .env if needed (Telegram bot token, etc.)

# 3. Run
docker-compose up -d

# 4. Migrate database
docker-compose exec backend npm run migrate:latest

# 5. Open in browser
# Frontend: http://localhost:5173
# API: http://localhost:3000/api
```

## First Steps

1. **Register Account** - Visit http://localhost:5173/register
2. **Login** - Use your credentials
3. **View Dashboard** - See your game collection
4. **Connect Telegram** - Send `/start` to your bot (optional)
5. **Run Collection** - Click button to fetch free games

## Next Commands

```bash
# View logs
docker-compose logs -f backend

# Stop everything
docker-compose down

# Restart services
docker-compose restart backend

# Shell into container
docker-compose exec backend sh

# Run migrations
docker-compose exec backend npm run migrate:latest
```

## Telegram Bot Setup

1. Open Telegram → Search **@BotFather**
2. `/newbot` → Give your bot a name
3. Copy the **Token**
4. Edit `backend/.env`:
   ```
   TELEGRAM_BOT_TOKEN=your_token_here
   ```
5. Restart backend: `docker-compose restart backend`
6. Find your bot in Telegram and send `/start`

## Default Credentials (for testing)

- **Email**: test@example.com
- **Password**: test1234

## Useful URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Health Check: http://localhost:3000/api/health
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Troubleshooting

### Docker won't start
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :5173
lsof -i :5432

# Kill processes if needed
lsof -ti:3000 | xargs kill -9
```

### Database error
```bash
# Reset database
docker-compose down -v  # Remove volumes
docker-compose up -d
docker-compose exec backend npm run migrate:latest
```

### Can't connect to API
```bash
# Check backend logs
docker-compose logs backend

# Check if backend is running
curl http://localhost:3000/api/health
```

## File Structure

```
free-games-claimer/
├── backend/          # Express.js API
│   ├── src/
│   │   ├── api/      # Routes
│   │   ├── config/   # Configuration
│   │   ├── middleware/ # Auth, errors
│   │   ├── workers/  # Game scrapers
│   │   └── telegram/ # Bot
│   └── migrations/   # Database
├── frontend/         # React app
│   ├── src/
│   │   ├── pages/    # Routes
│   │   ├── components/ # React components
│   │   ├── services/ # API client
│   │   └── store/    # State management
├── docker-compose.yml
└── .env.example
```

## Next Steps

1. Read [INSTALL.md](./INSTALL.md) for detailed setup
2. Check [API.md](./API.md) for API documentation
3. See [DEPLOYMENT.md](./DEPLOYMENT.md) for production
4. Visit [GitHub](https://github.com/derneder/free-games-claimer) for more

Enjoy collecting free games! 🎮🎆
