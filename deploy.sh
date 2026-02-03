#!/bin/bash

# Production Deployment Script
# Usage: ./deploy.sh [version]

set -e

echo "🚀 Starting production deployment..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}ℹ${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check environment
if [ ! -f .env.prod ]; then
    log_error ".env.prod not found!"
    exit 1
fi

# Load environment
source .env.prod

VERSION=${1:-$(date +%Y%m%d_%H%M%S)}
log_info "Deploying version: $VERSION"

# Backup database
log_info "Creating database backup..."
BACKUP_DIR="/var/backups/free-games"
mkdir -p $BACKUP_DIR
BACKUP_FILE="$BACKUP_DIR/backup_$VERSION.sql.gz"

docker-compose exec -T postgres pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE
log_info "Database backed up to $BACKUP_FILE"

# Stop old containers
log_info "Stopping current containers..."
docker-compose -f docker-compose.prod.yml stop

# Pull latest images
log_info "Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

# Build new images
log_info "Building new images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start new containers
log_info "Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
log_info "Waiting for services to be healthy..."
sleep 5
for i in {1..30}; do
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_info "Services are healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Services failed to become healthy"
        exit 1
    fi
    log_warn "Waiting for services... ($i/30)"
    sleep 2
done

# Run migrations
log_info "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend node database/migrate.js migrate

# Health check
log_info "Running health checks..."
if ! curl -f http://localhost/health > /dev/null 2>&1; then
    log_error "Health check failed!"
    log_warn "Rolling back..."
    docker-compose -f docker-compose.prod.yml down
    exit 1
fi

log_info "Cleaning up logs..."
docker-compose -f docker-compose.prod.yml exec -T backend rm -rf /var/log/old_*.log

log_info "✓ Deployment completed successfully!"
log_info "Version: $VERSION"
log_info "Timestamp: $(date)"
