#!/bin/bash

# Production Rollback Script
# Usage: ./rollback.sh [backup_file]

set -e

echo "🔄 Starting rollback..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}ℹ${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

if [ ! -f .env.prod ]; then
    log_error ".env.prod not found!"
    exit 1
fi

source .env.prod

BACKUP_FILE=${1:-$(ls -t /var/backups/free-games/backup_*.sql.gz | head -1)}

if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

log_info "Using backup: $BACKUP_FILE"

# Stop containers
log_info "Stopping containers..."
docker-compose -f docker-compose.prod.yml stop

# Restore database
log_info "Restoring database from backup..."
gunzip < $BACKUP_FILE | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U $DB_USER $DB_NAME

# Start containers
log_info "Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for health
log_info "Waiting for services..."
sleep 5

if curl -f http://localhost/health > /dev/null 2>&1; then
    log_info "✓ Rollback completed successfully!"
else
    log_error "Services failed to become healthy after rollback"
    exit 1
fi
