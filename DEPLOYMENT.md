# 🚀 Production Deployment Guide

**Status:** Ready for Production  
**Last Updated:** 2026-02-03  

---

## 📋 Prerequisites

### Server Requirements
- Ubuntu 20.04 LTS or CentOS 8+
- Docker & Docker Compose
- Nginx (optional, for reverse proxy)
- PostgreSQL 15 (if not using Docker)
- Redis 7 (if not using Docker)
- 2GB+ RAM
- 20GB+ Storage
- SSH access

### Domain Setup
- Domain name
- SSL certificate (via Let's Encrypt)
- DNS records configured

---

## 🔧 Pre-Deployment Setup

### 1. Clone Repository
```bash
git clone https://github.com/derneder/free-games-claimer.git
cd free-games-claimer
```

### 2. Create Environment
```bash
cp .env.prod.example .env.prod
# Edit with production values
nano .env.prod
```

### 3. Generate Security Keys
```bash
# Generate JWT secret
openssl rand -base64 32

# Generate session secret
openssl rand -base64 32

# Generate Redis password
openssl rand -base64 16
```

### 4. Setup SSL Certificates
```bash
# Using Let's Encrypt
certbot certonly --standalone -d your-domain.com

# Create SSL directory
mkdir -p ssl
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/
chmod 600 ssl/privkey.pem
```

---

## 📦 Deployment Steps

### 1. Initial Deployment
```bash
# Make scripts executable
chmod +x deploy.sh rollback.sh monitoring.sh backup.sh

# Run deployment
./deploy.sh v1.0.0
```

### 2. Verify Deployment
```bash
# Check containers
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Health check
curl https://your-domain.com/health
```

### 3. Setup Automatic Backups
```bash
# Add to crontab
crontab -e

# Add this line (daily backup at 2 AM)
0 2 * * * /path/to/free-games-claimer/backup.sh
```

### 4. Setup Monitoring
```bash
# Run monitoring in background
nohup ./monitoring.sh &

# Or use systemd
sudo systemctl start free-games-monitoring
```

---

## 📊 Monitoring

### Health Checks
```bash
# Manual health check
curl https://your-domain.com/health

# With verbose output
curl -v https://your-domain.com/health
```

### View Logs
```bash
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# Database logs
docker-compose logs postgres

# Nginx logs
docker-compose logs nginx
```

### System Monitoring
```bash
# Container stats
docker stats

# Disk usage
df -h

# Memory usage
free -h

# Database stats
docker-compose exec postgres psql -U $DB_USER -d $DB_NAME -c "SELECT * FROM pg_stat_statements LIMIT 10;"
```

---

## 🔄 Updates

### Regular Updates
```bash
# Pull latest code
git pull origin main

# Deploy new version
./deploy.sh
```

### Security Updates
```bash
# Update dependencies
docker-compose -f docker-compose.prod.yml pull

# Rebuild images
docker-compose -f docker-compose.prod.yml build --no-cache

# Deploy
./deploy.sh
```

### Emergency Rollback
```bash
# Rollback to previous version
./rollback.sh

# Or specify backup file
./rollback.sh /var/backups/free-games/backup_20260203_145300.sql.gz
```

---

## 💾 Backup & Recovery

### Manual Backup
```bash
# Backup database
./backup.sh

# Verify backup
ls -lh /var/backups/free-games/
```

### Restore from Backup
```bash
# List available backups
ls /var/backups/free-games/

# Restore
./rollback.sh /var/backups/free-games/backup_20260203_145300.sql.gz
```

---

## 🔐 Security

### SSL/TLS
- Automatically configured via Let's Encrypt
- Auto-renewal via certbot

### Firewall
```bash
# Allow SSH, HTTP, HTTPS only
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Database
- Runs in private network
- Password protected
- Encrypted connections

### Environment Variables
- Never commit .env.prod
- Use strong random strings
- Rotate regularly

---

## 📈 Performance Tuning

### Database
```sql
-- Enable indexes
CREATE INDEX idx_games_claimedAt ON games(claimedAt DESC);
CREATE INDEX idx_activityLogs_createdAt ON activityLogs(createdAt DESC);

-- Run VACUUM
VACUUM ANALYZE;
```

### Redis
```bash
# Monitor Redis
docker-compose exec redis redis-cli monitor

# Get stats
docker-compose exec redis redis-cli INFO stats
```

### Nginx
- Gzip compression enabled
- Caching configured
- Rate limiting active

---

## 🚨 Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose logs backend

# Check configuration
cat .env.prod

# Verify database connection
docker-compose exec backend node -e "require('pg').Client"
```

### High CPU Usage
```bash
# Check which container
docker stats

# Check logs for errors
docker-compose logs

# Restart container
docker-compose restart backend
```

### High Memory Usage
```bash
# Check Node.js heap
docker-compose exec backend node -e "console.log(require('os').totalmem())"

# Restart services
docker-compose restart

# Check for memory leaks
docker-compose logs backend | grep -i memory
```

---

## 📞 Support

- Check logs: `docker-compose logs`
- Review `.github/workflows/deploy.yml`
- Check `DEVELOPMENT_GUIDE.md`
- Monitor `monitoring.log`

---

## ✅ Deployment Checklist

- [ ] Prerequisites met
- [ ] Domain configured
- [ ] SSL certificate obtained
- [ ] Environment variables set
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Health checks passing
- [ ] Database migrated
- [ ] Tests passing
- [ ] Initial deployment complete

---

**Ready for production deployment!** 🚀
