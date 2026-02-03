# Free Games Claimer PRO

🎮 Автоматический сборщик бесплатных игр с Epic Games, GOG, Steam и Prime Gaming.

## 🎯 Возможности

- ✅ **Автоматическая сборка** - Собирает бесплатные игры с 4 источников
- ✅ **Веб-интерфейс** - React приложение с красивым UI
- ✅ **Telegram бот** - Управление через Telegram
- ✅ **Аналитика** - Статистика по играм и источникам
- ✅ **2FA** - Двухфакторная аутентификация
- ✅ **Docker** - Готовые контейнеры для быстрого старта

## 🚀 Быстрый старт

### 1. Требования
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 16 (или используй Docker)
- Redis (или используй Docker)

### 2. Установка

```bash
# Клонируй проект
git clone https://github.com/derneder/free-games-claimer.git
cd free-games-claimer

# Создай .env файл
cp .env.example .env

# Отредактируй .env если нужно

# Запусти Docker
docker-compose up -d

# Дождись инициализации (2-3 минуты)
```

### 3. Доступ

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000/api
- **API Docs**: http://localhost:3000/api/docs

## 📋 Структура проекта

```
free-games-claimer/
├── backend/              # Express.js + PostgreSQL + Redis
│   ├── src/
│   │   ├── api/         # API routes
│   │   ├── workers/     # Game scrapers
│   │   ├── telegram/    # Telegram bot
│   │   ├── config/      # Configuration
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Utilities
│   ├── migrations/      # Database migrations
│   └── package.json
│
├── frontend/             # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks
│   │   ├── store/       # Zustand store
│   │   ├── services/    # API services
│   │   └── App.jsx
│   └── package.json
│
├── docker-compose.yml   # Docker setup
├── .env.example         # Environment template
└── README.md
```

## 🔐 Безопасность

- JWT аутентификация (15 минут)
- TOTP 2FA (Google Authenticator)
- bcrypt password hashing
- Rate limiting (100 req/15min)
- CORS настройки
- AES-256 encryption

## 🎮 Поддерживаемые источники

1. **Epic Games Store** - GraphQL API
2. **GOG.com** - HTML parsing
3. **Steam** - REST API
4. **Amazon Prime Gaming** - Web scraping

## 🤖 Telegram Bot

- `/start` - Инициализация
- `/stats` - Статистика
- `/recent` - Последние 5 игр
- `/run` - Запустить сборку
- `/settings` - Настройки
- `/help` - Справка

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/2fa/setup` - Настройка 2FA
- `POST /api/auth/2fa/verify` - Верификация 2FA

### Games
- `GET /api/games` - Список игр
- `GET /api/games/:id` - Одна игра
- `GET /api/games/search/:query` - Поиск
- `POST /api/games` - Добавить игру
- `DELETE /api/games/:id` - Удалить игру

### Analytics
- `GET /api/analytics/stats` - Статистика
- `GET /api/analytics/distribution` - Распределение
- `GET /api/analytics/activity` - Активность
- `GET /api/analytics/export/:format` - Экспорт (csv/json)

## 🐛 Troubleshooting

### "Cannot find module"
```bash
cd backend && npm install
cd ../frontend && npm install
```

### "Database connection failed"
```bash
docker-compose down
docker-compose up -d
```

### "Telegram bot not responding"
- Проверь TELEGRAM_BOT_TOKEN в .env
- Получи новый токен: @BotFather в Telegram

## 📈 Статистика проекта

| Метрика | Кол-во |
|---------|--------|
| API endpoints | 20+ |
| React components | 10+ |
| Database tables | 9 |
| Game sources | 4 |
| Telegram commands | 6 |
| Lines of code | ~3000 |

## 📝 License

MIT

## 🤝 Contributing

Приветствуются pull requests! 🎉

## 📞 Support

Открой issue на GitHub для любых вопросов.
