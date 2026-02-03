# 🚀 Deployment Guide

## Production Environment

### 1. Environment Setup

Update `.env` with production values:

```bash
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com
DB_HOST=your-postgres-host
DB_USER=prod_user
DB_PASSWORD=strong_password_here
JWT_SECRET=use_cryptographically_secure_key
```

### 2. Build Docker Images

```bash
docker-compose -f docker-compose.yml build
```

### 3. Deploy

#### Option A: Heroku

```bash
heroku login
heroku create your-app-name
heroku config:set NODE_ENV=production
# ... add other env vars
git push heroku main
```

#### Option B: AWS/DigitalOcean

```bash
# Build and push to Docker registry
docker build -t your-registry/backend ./backend
docker push your-registry/backend

# Update docker-compose with your registry
# Deploy with Docker Swarm or Kubernetes
```

#### Option C: Self-hosted (VPS)

```bash
# SSH into VPS
ssh user@your-vps.com

# Clone repo
git clone https://github.com/derneder/free-games-claimer.git
cd free-games-claimer

# Update .env for production

# Start with Docker
docker-compose up -d

# Setup SSL with Let's Encrypt
sudo certbot certonly --standalone -d your-domain.com
```

### 4. Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:5173;
    }
}
```

## Monitoring

### Logs

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# System logs
tail -f /var/log/syslog
```

### Health Check

```bash
curl https://your-domain.com/api/health
```

### Backup Database

```bash
# Daily backup
0 2 * * * pg_dump -U $DB_USER $DB_NAME | gzip > /backups/$(date +\%Y\%m\%d).sql.gz
```

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Enable 2FA for admin accounts
- [ ] Setup HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Enable database backups
- [ ] Setup monitoring and alerts
- [ ] Regular security updates
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Environment variables not exposed

## Performance Optimization

### Database

```sql
-- Add indexes
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_games_obtained_at ON games(obtained_at);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);

-- Analyze query plans
EXPLAIN ANALYZE SELECT * FROM games WHERE user_id = 1;
```

### Redis Caching

```javascript
// Cache frequently accessed data
await redis.setex('games:user:1', 3600, JSON.stringify(games));
```

### Frontend

- Enable gzip compression
- Minify and bundle assets
- Use CDN for static files
- Lazy load images

## Maintenance

### Update Dependencies

```bash
npm outdated
npm update
npm audit fix
```

### Database Maintenance

```bash
# Vacuum and analyze
VACUUM ANALYZE;

# Check for missing indexes
SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;
```

## Disaster Recovery

### Database Restore

```bash
gunzip < /backups/20240203.sql.gz | psql -U $DB_USER $DB_NAME
```

### Full Rollback

```bash
# Git rollback
git revert <commit-hash>
git push production main

# Docker rollback
docker pull your-registry/backend:latest
docker-compose up -d
```
