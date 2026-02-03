# 🎮 Free Games Claimer

Automated tool to claim free games from Epic Games, GOG, Steam, and Prime Gaming.

## 📋 Overview

This project automatically monitors and claims free games from multiple platforms, keeping your game library up to date.

**Main Features:**
- 🤖 Automated game claiming
- 🎮 Support for Epic Games, GOG, Steam, Prime Gaming
- 📊 Admin dashboard with analytics
- 👥 User management
- 🔐 Secure authentication with 2FA
- 📧 Email notifications
- 📈 Real-time analytics and reporting

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### Installation

```bash
# Clone repository
git clone https://github.com/derneder/free-games-claimer.git
cd free-games-claimer

# Backend setup
cd backend && npm install

# Frontend setup
cd ../frontend && npm install
```

### Running

```bash
# Backend (Terminal 1)
cd backend && npm run dev

# Frontend (Terminal 2)
cd frontend && npm run dev
```

Visit `http://localhost:5173`

---

## 📁 Project Structure

```
free-games-claimer/
├── backend/                    # Express API + Jest tests
├── frontend/                   # React + Tailwind UI
├── docs/                       # 📚 Documentation
├── Dockerfile
├── docker-compose.yml
└── *.js                        # Scrapers
```

---

## 📚 Documentation

**👉 All documentation is in the `/docs` folder:**

1. **[docs/README.md](./docs/README.md)** - START HERE
2. **[docs/PHASE_1_SUMMARY.md](./docs/PHASE_1_SUMMARY.md)** - Features & status
3. **[docs/INTEGRATION_GUIDE.md](./docs/INTEGRATION_GUIDE.md)** - Setup instructions
4. **[docs/DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md)** - Deployment
5. **[docs/GIT_COMMIT_INSTRUCTIONS.md](./docs/GIT_COMMIT_INSTRUCTIONS.md)** - Git workflow
6. **[docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)** - Contributing

---

## ✅ Features

### Phase 1 (Complete) ✅
- Jest Testing Framework (75+ test cases)
- Swagger/OpenAPI Documentation
- CSRF Protection & Security Headers
- Email Notifications
- Admin Dashboard
- Analytics Charts

---

## 🔐 Security

✅ CSRF Protection  
✅ Helmet Headers  
✅ JWT Authentication  
✅ 2FA Support  
✅ Password Hashing  
✅ XSS Protection  
✅ Secure Cookies  

---

## 🧪 Testing

```bash
# Run tests
npm test

# Coverage
npm run test:coverage
```

**Coverage:** 70%+ | **Tests:** 75+

---

## 📊 API Docs

Swagger available at `http://localhost:3000/docs`

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express, PostgreSQL, Redis, Jest  
**Frontend:** React 18, Vite, Tailwind CSS, Recharts  
**Docs:** Swagger/OpenAPI  
**Security:** Helmet, CSRF, JWT, 2FA  

---

## 🐳 Docker

```bash
docker-compose up -d
```

---

## 🤝 Contributing

See [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)

---

## 📄 License

MIT - See [LICENSE](./LICENSE)

---

## 🆘 Support

- [Docs](./docs/README.md)
- [Issues](https://github.com/derneder/free-games-claimer/issues)
- [Discussions](https://github.com/derneder/free-games-claimer/discussions)

---

**Status:** Phase 1 ✅ | **Ready:** Production ✓ | **Read:** [docs/README.md](./docs/README.md)

**Made with ❤️**
