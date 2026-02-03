#!/bin/bash

# Production Monitoring Script
# Monitor application health and performance

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARN${NC} $1"
}

MONITOR_LOG="/var/log/free-games/monitoring.log"
mkdir -p "$(dirname "$MONITOR_LOG")"

log_info "Starting monitoring..." | tee -a $MONITOR_LOG

while true; do
    # Check Docker containers
    log_info "Checking container status..." | tee -a $MONITOR_LOG
    
    CONTAINER_STATUS=$(docker-compose -f docker-compose.prod.yml ps --services --filter "status=running" | wc -l)
    if [ $CONTAINER_STATUS -lt 5 ]; then
        log_error "Not all containers are running! Running: $CONTAINER_STATUS/5" | tee -a $MONITOR_LOG
    else
        log_info "All containers running (5/5)" | tee -a $MONITOR_LOG
    fi

    # Check health endpoint
    log_info "Checking health endpoint..." | tee -a $MONITOR_LOG
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_info "Health check passed ✓" | tee -a $MONITOR_LOG
    else
        log_error "Health check failed! ✗" | tee -a $MONITOR_LOG
    fi

    # Check database connection
    log_info "Checking database connection..." | tee -a $MONITOR_LOG
    if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready > /dev/null 2>&1; then
        log_info "Database connection OK" | tee -a $MONITOR_LOG
    else
        log_error "Database connection failed!" | tee -a $MONITOR_LOG
    fi

    # Check Redis connection
    log_info "Checking Redis connection..." | tee -a $MONITOR_LOG
    if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
        log_info "Redis connection OK" | tee -a $MONITOR_LOG
    else
        log_error "Redis connection failed!" | tee -a $MONITOR_LOG
    fi

    # Check disk space
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $DISK_USAGE -gt 90 ]; then
        log_warn "Disk usage high: ${DISK_USAGE}%" | tee -a $MONITOR_LOG
    else
        log_info "Disk usage: ${DISK_USAGE}%" | tee -a $MONITOR_LOG
    fi

    # Check memory
    MEMORY_USAGE=$(free | awk 'NR==2{printf("%.0f", $3/$2 * 100)}')
    if [ $MEMORY_USAGE -gt 85 ]; then
        log_warn "Memory usage high: ${MEMORY_USAGE}%" | tee -a $MONITOR_LOG
    else
        log_info "Memory usage: ${MEMORY_USAGE}%" | tee -a $MONITOR_LOG
    fi

    log_info "---" | tee -a $MONITOR_LOG
    
    # Wait 5 minutes before next check
    sleep 300
done
