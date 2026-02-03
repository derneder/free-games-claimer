# 🔧 Troubleshooting Guide

**Last Updated:** 2026-02-03  

---

## 🆘 Common Issues

### 1. Application Won't Start

**Symptoms:** Container exits immediately

**Solutions:**
```bash
# Check logs
docker-compose logs backend

# Common causes:
# 1. Database not ready
#    Solution: Wait for PostgreSQL to start
#    docker-compose exec postgres pg_isready

# 2. Port already in use
#    Solution: Kill process or use different port
#    lsof -i :3000
#    kill -9 <PID>

# 3. Environment variables missing
#    Solution: Check .env file
#    cat .env

# 4. Database migrations failed
#    Solution: Run migrations manually
#    docker-compose exec backend node database/migrate.js all
```

---

### 2. Database Connection Error

**Symptoms:** "Cannot connect to database" error

**Solutions:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Verify connection string
echo $DATABASE_URL

# Test connection directly
docker-compose exec postgres psql -U postgres -c "SELECT 1"

# Reset PostgreSQL
docker-compose down -v
docker-compose up postgres

# Recreate database
docker-compose exec backend node database/migrate.js all
```

---

### 3. Redis Connection Error

**Symptoms:** "Cannot connect to Redis" error

**Solutions:**
```bash
# Check Redis is running
docker-compose ps redis

# Check Redis logs
docker-compose logs redis

# Test connection
docker-compose exec redis redis-cli ping
# Should return: PONG

# Check Redis memory
docker-compose exec redis redis-cli INFO memory

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL

# Restart Redis
docker-compose restart redis
```

---

### 4. Authentication Issues

**Symptoms:** Login fails or token issues

**Solutions:**
```bash
# Check JWT secret is set
echo $JWT_SECRET

# Verify user exists in database
docker-compose exec postgres psql -U postgres free_games_dev \
  -c "SELECT * FROM users WHERE email='test@example.com';"

# Check password is hashed
# Password should start with $2b$

# Reset user password
docker-compose exec backend node -e "
const crypto = require('crypto');
console.log('Hash this:', crypto.randomBytes(32).toString('hex'));
"

# Verify token expiration
echo $JWT_EXPIRES
```

---

### 5. High Memory Usage

**Symptoms:** Application slow or crashes

**Solutions:**
```bash
# Check memory usage
docker stats

# Check Node.js heap
docker-compose exec backend node -e "console.log(require('os').freemem() / 1024 / 1024)"

# Restart containers
docker-compose restart

# Clear cache
docker-compose exec redis redis-cli FLUSHALL

# Check for memory leaks
docker-compose logs backend | grep -i memory

# Increase memory limit
# Edit docker-compose.yml:
# services:
#   backend:
#     mem_limit: 1g
```

---

### 6. High CPU Usage

**Symptoms:** Server very slow or unresponsive

**Solutions:**
```bash
# Check CPU usage
docker stats

# Check which container
docker-compose top backend

# Check for stuck processes
docker-compose exec backend ps aux

# Check for infinite loops
docker-compose logs backend | head -100

# Restart container
docker-compose restart backend

# Check database queries
docker-compose exec postgres psql -U postgres free_games_dev \
  -c "SELECT query, calls, mean_exec_time FROM pg_stat_statements LIMIT 10;"
```

---

### 7. Disk Space Issues

**Symptoms:** "No space left on device" error

**Solutions:**
```bash
# Check disk usage
df -h

# Check Docker disk usage
docker system df

# Clean up Docker
docker system prune -a

# Remove old logs
docker-compose logs backend | head -100000 > backup.log

# Backup database and restore
./backup.sh
docker volume prune

# Increase disk space
# Add more storage to VM/server
```

---

### 8. SSL Certificate Issues

**Symptoms:** HTTPS connection errors

**Solutions:**
```bash
# Check certificate validity
ssl -noout -dates /etc/nginx/ssl/fullchain.pem

# Check certificate expiration
openssl x509 -in /etc/nginx/ssl/fullchain.pem -noout -dates

# Renew certificate
certbot renew --force-renewal

# Update certificate
cp /etc/letsencrypt/live/domain.com/* /etc/nginx/ssl/

# Restart Nginx
ngix -s reload
```

---

### 9. API Response Slow

**Symptoms:** Requests take too long

**Solutions:**
```bash
# Check database query performance
docker-compose exec postgres psql -U postgres free_games_dev -c "
  SELECT query, calls, mean_exec_time 
  FROM pg_stat_statements 
  ORDER BY mean_exec_time DESC 
  LIMIT 10;
"

# Add missing indexes
docker-compose exec postgres psql -U postgres free_games_dev -c "
  CREATE INDEX idx_games_user_id ON games(user_id);
  CREATE INDEX idx_activity_user_id ON activity_logs(user_id);
"

# Analyze query plans
docker-compose exec postgres psql -U postgres free_games_dev -c "
  EXPLAIN ANALYZE SELECT * FROM games WHERE user_id = 'uuid';
"

# Check Redis performance
docker-compose exec redis redis-cli latency doctor

# Enable query logging
echo "log_statement = 'all'" >> postgresql.conf
```

---

### 10. Tests Failing

**Symptoms:** Jest tests error out

**Solutions:**
```bash
# Check test database
docker-compose exec postgres psql -U postgres -l | grep test

# Run migration for test database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/free_games_test \
docker-compose exec backend node database/migrate.js all

# Run tests with debug
DEBUG=* npm test

# Run specific test
npm test -- auth.test.js

# Clear cache
rm -rf node_modules/.cache
npm test -- --clearCache

# Check test timeout
# Edit jest.config.js:
# testTimeout: 30000
```

---

## 🔍 Debugging Tips

### Enable Debug Logging
```bash
# Set debug mode
export DEBUG=*

# Or in .env
LOG_LEVEL=debug

# Restart services
docker-compose restart backend

# View debug logs
docker-compose logs -f backend
```

### Database Debugging
```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d free_games_dev

# Check table structure
\d users

# List all tables
\dt

# Check table size
\dt+ games

# List indexes
\di

# Check slow queries
SET log_min_duration_statement = 1000;

# Exit
\q
```

### API Debugging
```bash
# Test endpoint
curl -v http://localhost:3000/api/health

# With authentication
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/games

# Test database connection
curl http://localhost:3000/api/admin/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Check response headers
curl -i http://localhost:3000/health
```

### Container Debugging
```bash
# Enter container shell
docker-compose exec backend bash

# Check running processes
ps aux

# Check environment variables
env | grep DATABASE

# Check file permissions
ls -la /app

# Check network connectivity
ping postgres
nslookup postgres
```

---

## 📋 Health Check

### Quick Health Check
```bash
#!/bin/bash

echo "Checking application health..."

# Check containers
echo "✓ Checking containers"
docker-compose ps

# Check database
echo "✓ Checking database"
docker-compose exec postgres pg_isready

# Check Redis
echo "✓ Checking Redis"
docker-compose exec redis redis-cli ping

# Check API
echo "✓ Checking API"
curl -f http://localhost:3000/health

# Check frontend
echo "✓ Checking frontend"
curl -f http://localhost:5173/

echo "✓ All systems operational!"
```

---

## 📞 Getting Help

1. **Check Documentation**
   - ARCHITECTURE.md
   - DEVELOPMENT_GUIDE.md
   - API_ERRORS.md

2. **Check Logs**
   - Application logs: `docker-compose logs backend`
   - Database logs: `docker-compose logs postgres`
   - System logs: Check `/var/log/`

3. **Check GitHub Issues**
   - Search existing issues
   - Create new issue with logs

4. **Contact Support**
   - Email: support@example.com
   - Discord: [Join server]
   - GitHub Discussions

---

**Happy debugging! 🐛**
