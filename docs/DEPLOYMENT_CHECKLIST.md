# 🚀 Production Deployment Checklist

## 📋 Pre-Deployment Phase

### ✅ Code Review

- [ ] All tests passing: `npm test` ✅
- [ ] Coverage >= 70%: `npm run test:coverage`
- [ ] No console errors
- [ ] No ESLint warnings
- [ ] Code reviewed and approved

### ✅ Environment Configuration

**Backend .env**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=long_random_secret_string
JWT_REFRESH_SECRET=another_long_random_secret
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_FROM=noreply@free-games-claimer.com
ADMIN_EMAIL=admin@your-domain.com
CSRF_SECRET=csrf_secret_here
FRONTEND_URL=https://your-domain.com
LOG_LEVEL=info
```

**Frontend .env**
```env
VITE_API_URL=https://api.your-domain.com
VITE_APP_NAME="Free Games Claimer"
VITE_ENVIRONMENT=production
```

---

## 📂 Infrastructure Phase

### ✅ Database Setup

- [ ] PostgreSQL 14+ installed
- [ ] Database created
- [ ] Migrations ran: `npm run migrate`
- [ ] Indexes created
- [ ] Backups configured
- [ ] Connection tested

### ✅ Caching Setup

- [ ] Redis 7+ installed
- [ ] Redis configured for persistence
- [ ] Memory limits set
- [ ] Connection tested

### ✅ SSL/TLS Certificates

- [ ] SSL certificates obtained (Let's Encrypt)
- [ ] Certificates installed
- [ ] Certificate renewal automated
- [ ] HSTS enabled

---

## 🐋 Build & Deployment

### ✅ Backend Build

```bash
cd backend

# Clean build
rm -rf node_modules package-lock.json
npm install --production

# Verify
npm test

# Build (if applicable)
npm run build
```

- [ ] Build successful
- [ ] All dependencies installed
- [ ] No build warnings

### ✅ Frontend Build

```bash
cd frontend

# Clean build
rm -rf node_modules package-lock.json
npm install --production

# Build
npm run build

# Verify build
ls -la dist/
```

- [ ] Build successful
- [ ] dist/ folder created
- [ ] All assets optimized
- [ ] Size acceptable (< 5MB gzipped)

---

## 📊 Deployment Methods

### Option 1: Docker (Recommended)

**Create docker-compose.yml in project root:**

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: free_games
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/free_games
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:3000"
    environment:
      VITE_API_URL: https://api.your-domain.com
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

**Deploy:**
```bash
docker-compose -f docker-compose.yml up -d
```

- [ ] Backend running
- [ ] Frontend running
- [ ] Database connected
- [ ] Redis connected

### Option 2: Traditional Server (Linux)

```bash
# 1. SSH into server
ssh user@server.com

# 2. Clone repository
git clone https://github.com/your-repo.git
cd free-games-claimer
git checkout implementation

# 3. Install dependencies
cd backend && npm install --production
cd ../frontend && npm install --production

# 4. Build frontend
npm run build

# 5. Configure Systemd service
sudo cp backend/free-games-claimer.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable free-games-claimer
sudo systemctl start free-games-claimer

# 6. Setup Nginx reverse proxy
sudo apt-get install nginx
sudo cp backend/nginx.conf /etc/nginx/sites-available/free-games-claimer
sudo ln -s /etc/nginx/sites-available/free-games-claimer /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

- [ ] Service running
- [ ] Nginx configured
- [ ] SSL certificates active

---

## 🗁 Post-Deployment Phase

### ✅ Verification

```bash
# API Health Check
curl -X GET https://your-domain.com/api/health

# Swagger Docs
curl -X GET https://your-domain.com/api/docs

# Admin Dashboard
curl -X GET https://your-domain.com/admin
```

- [ ] API responding with 200
- [ ] Swagger docs accessible
- [ ] Frontend pages loading
- [ ] No 5xx errors

### ✅ Security Verification

- [ ] HTTPS enforced
- [ ] Security headers present:
  ```bash
  curl -i https://your-domain.com/ | grep -i 'x-frame-options\|strict-transport\|content-security'
  ```
- [ ] CSRF tokens working
- [ ] JWT tokens valid
- [ ] Database credentials secure
- [ ] No hardcoded secrets

### ✅ Performance Check

```bash
# Response time
time curl https://your-domain.com/api/health

# Database queries
Npm run analyze:db

# Frontend performance
Npm run lighthouse
```

- [ ] API response < 200ms
- [ ] Database queries optimized
- [ ] Frontend Lighthouse > 80
- [ ] Images optimized

### ✅ Monitoring Setup

- [ ] Error logging configured (e.g., Sentry)
- [ ] Performance monitoring active (e.g., New Relic)
- [ ] Uptime monitoring enabled
- [ ] Email alerts configured
- [ ] Log rotation set up

---

## 📊 Database Migration

```bash
# Create backup first
Npm run backup:database

# Run migrations
Npm run migrate:production

# Verify
Npm run check:database

# Rollback if needed
Npm run migrate:rollback
```

- [ ] Backup created
- [ ] Migrations successful
- [ ] Data integrity verified
- [ ] Rollback tested

---

## 🗑 Cleanup & Maintenance

### ✅ Before Going Live

- [ ] Remove all console.logs
- [ ] Remove test data
- [ ] Remove debug endpoints
- [ ] Update version numbers
- [ ] Update documentation
- [ ] Create CHANGELOG

### ✅ Post-Launch

- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] User feedback collection
- [ ] Automated backups running
- [ ] Security patches applied

---

## 💾 Maintenance Schedule

**Daily:**
- [ ] Check error logs
- [ ] Verify backups
- [ ] Monitor uptime

**Weekly:**
- [ ] Review performance metrics
- [ ] Check security updates
- [ ] Database optimization

**Monthly:**
- [ ] Full backup verification
- [ ] Security audit
- [ ] Dependency updates

---

## 🚆 Rollback Plan

If deployment fails:

```bash
# 1. Stop services
sudo systemctl stop free-games-claimer

# 2. Restore previous version
git checkout HEAD~1
cd backend && npm install
cd ../frontend && npm run build

# 3. Restore database backup
Npm run restore:backup backup_date.sql

# 4. Start services
sudo systemctl start free-games-claimer

# 5. Verify
curl https://your-domain.com/api/health
```

- [ ] Rollback tested in staging
- [ ] Backup restoration verified
- [ ] Communication plan ready

---

## 📧 Support & Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
npm run db:test
```

**CORS Errors:**
```javascript
// Check CORS configuration in backend
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

**SSL Certificate Error:**
```bash
# Check certificate
sudo openssl x509 -in /etc/ssl/certs/your-cert.crt -text -noout

# Renew if needed
sudo certbot renew
```

**High Memory Usage:**
```bash
# Check process
ps aux | grep node

# Monitor
top -p $(pgrep -f 'node')
```

---

## ✅ Final Checklist

- [ ] All tests passing
- [ ] Environment configured
- [ ] Database migrated
- [ ] SSL certificates active
- [ ] Monitoring set up
- [ ] Backups verified
- [ ] Security audit completed
- [ ] Performance validated
- [ ] Team trained
- [ ] Documentation updated
- [ ] Rollback plan ready
- [ ] Go/No-Go decision made

---

**Status:** Ready for Production Deployment ✅
