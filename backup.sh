#!/bin/bash

# Automated Backup Script
# Run via cron for automatic backups

set -e

# Configuration
BACKUP_DIR="/var/backups/free-games"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"
BACKUP_LOG="/var/log/free-games/backup.log"

mkdir -p $BACKUP_DIR
mkdir -p $(dirname $BACKUP_LOG)

echo "[$(date)] Starting backup..." >> $BACKUP_LOG

source .env.prod

# Create backup
echo "[$(date)] Creating backup..." >> $BACKUP_LOG
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "[$(date)] Backup created: $BACKUP_FILE" >> $BACKUP_LOG
    echo "[$(date)] Backup size: $(du -h $BACKUP_FILE | cut -f1)" >> $BACKUP_LOG
else
    echo "[$(date)] Backup failed!" >> $BACKUP_LOG
    exit 1
fi

# Cleanup old backups
echo "[$(date)] Cleaning up old backups (older than $RETENTION_DAYS days)..." >> $BACKUP_LOG
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "[$(date)] Backup completed successfully" >> $BACKUP_LOG
