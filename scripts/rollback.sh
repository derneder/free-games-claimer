#!/bin/bash

################################################################################
# Free Games Claimer - Rollback Script
# Purpose: Rollback to previous stable version
# Usage: ./scripts/rollback.sh
################################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="${DEPLOY_DIR:-/opt/apps/free-games-claimer}"
BACKUP_DIR="${BACKUP_DIR:-/mnt/backups}"
LOG_DIR="${LOG_DIR:-/var/log/free-games-claimer}"
LOG_FILE="${LOG_DIR}/rollback.log"

################################################################################
# Utility Functions
################################################################################

log() {
  local message="$1"
  local timestamp
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${BLUE}[${timestamp}]${NC} ${message}" | tee -a "${LOG_FILE}"
}

error() {
  local message="$1"
  local exit_code="${2:-1}"
  local timestamp
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${RED}[ERROR ${timestamp}] ${message}${NC}" | tee -a "${LOG_FILE}" >&2
  exit "${exit_code}"
}

success() {
  local message="$1"
  local timestamp
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${GREEN}[${timestamp}] ✓ ${message}${NC}" | tee -a "${LOG_FILE}"
}

warn() {
  local message="$1"
  local timestamp
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${YELLOW}[WARNING ${timestamp}] ${message}${NC}" | tee -a "${LOG_FILE}"
}

ensure_directory() {
  local dir="$1"
  if [[ ! -d "${dir}" ]]; then
    mkdir -p "${dir}" || error "Failed to create directory: ${dir}"
  fi
}

################################################################################
# Rollback Functions
################################################################################

# Find latest backup
find_latest_backup() {
  if [[ ! -L "${BACKUP_DIR}/backup-latest" ]]; then
    error "No backup found. Cannot rollback."
  fi
  
  local backup_file
  backup_file=$(readlink "${BACKUP_DIR}/backup-latest")
  
  if [[ ! -f "${backup_file}" ]]; then
    error "Backup file not found: ${backup_file}"
  fi
  
  echo "${backup_file}"
}

# Restore from backup
restore_backup() {
  local backup_file="$1"
  
  log "Restoring from backup: ${backup_file}"
  
  # Stop services first
  log "Stopping services before restore"
  if command -v docker-compose &> /dev/null; then
    if docker-compose -f "${DEPLOY_DIR}/docker-compose.prod.yml" stop 2>>"${LOG_FILE}"; then
      success "Docker services stopped"
    else
      warn "Failed to stop Docker services"
    fi
  fi
  
  # Clean deploy directory (except .git and .env)
  log "Cleaning deployment directory"
  cd "${DEPLOY_DIR}" || error "Failed to change directory"
  
  find . -maxdepth 1 -type f -not -name '.env*' -delete
  find . -maxdepth 1 -type d -not -name '.' -not -name '.git' -exec rm -rf {} + 2>/dev/null || true
  
  # Extract backup
  log "Extracting backup"
  if tar -xzf "${backup_file}" -C "${DEPLOY_DIR}" 2>>"${LOG_FILE}"; then
    success "Backup restored"
  else
    error "Failed to extract backup"
  fi
}

# Restart services
restart_services() {
  log "Restarting services"
  
  if command -v docker-compose &> /dev/null; then
    if docker-compose -f "${DEPLOY_DIR}/docker-compose.prod.yml" up -d 2>>"${LOG_FILE}"; then
      success "Docker services started"
    else
      error "Failed to start Docker services"
    fi
  elif command -v systemctl &> /dev/null; then
    if systemctl start free-games-claimer 2>>"${LOG_FILE}"; then
      success "Service started"
    else
      error "Failed to start systemd service"
    fi
  else
    warn "Could not determine how to start services"
  fi
}

# Health check
health_check() {
  log "Running health checks"
  
  local max_attempts=30
  local attempt=0
  
  while (( attempt < max_attempts )); do
    if curl -sf http://localhost:3000/api/health >/dev/null 2>&1; then
      success "Health check passed"
      return 0
    fi
    
    attempt=$((attempt + 1))
    if (( attempt < max_attempts )); then
      log "Health check attempt ${attempt}/${max_attempts}..."
      sleep 2
    fi
  done
  
  error "Health check failed. System may be in inconsistent state."
}

################################################################################
# Main Execution
################################################################################

main() {
  # Setup
  ensure_directory "${LOG_DIR}"
  
  log "========================================"
  log "Rollback Started"
  log "Timestamp: $(date)"
  log "========================================"
  
  # Find backup
  log "Looking for latest backup"
  local backup_file
  backup_file=$(find_latest_backup)
  log "Latest backup found: ${backup_file}"
  
  # Confirm rollback
  if [[ -t 0 ]]; then
    echo ""
    echo -e "${YELLOW}WARNING: This will restore the previous version!${NC}"
    echo "Backup file: ${backup_file}"
    read -p "Are you sure you want to rollback? (yes/no): " -r response
    
    if [[ ! $response =~ ^[Yy][Ee][Ss]$ ]]; then
      log "Rollback cancelled"
      exit 0
    fi
  fi
  
  # Restore backup
  restore_backup "${backup_file}"
  
  # Restart services
  restart_services
  
  # Health checks
  health_check
  
  log "========================================"
  success "Rollback completed successfully!"
  log "Restored from: ${backup_file}"
  log "Timestamp: $(date)"
  log "========================================"
}

main "$@"
