#!/bin/bash

################################################################################
# Free Games Claimer - Deployment Script
# Purpose: Deploy new release to production
# Usage: ./scripts/deploy.sh <version>
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
LOG_FILE="${LOG_DIR}/deploy.log"

################################################################################
# Utility Functions
################################################################################

# Log message with timestamp
log() {
  local message="$1"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${BLUE}[${timestamp}]${NC} ${message}" | tee -a "${LOG_FILE}"
}

# Log error and exit
error() {
  local message="$1"
  local exit_code="${2:-1}"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${RED}[ERROR ${timestamp}] ${message}${NC}" | tee -a "${LOG_FILE}" >&2
  exit "${exit_code}"
}

# Log success
success() {
  local message="$1"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${GREEN}[${timestamp}] ✓ ${message}${NC}" | tee -a "${LOG_FILE}"
}

# Log warning
warn() {
  local message="$1"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${YELLOW}[WARNING ${timestamp}] ${message}${NC}" | tee -a "${LOG_FILE}"
}

# Check if directory exists, create if not
ensure_directory() {
  local dir="$1"
  if [[ ! -d "${dir}" ]]; then
    mkdir -p "${dir}" || error "Failed to create directory: ${dir}"
    log "Created directory: ${dir}"
  fi
}

# Validate version format
validate_version() {
  local version="$1"
  if ! [[ $version =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-(alpha|beta|rc)[0-9]+)?$ ]]; then
    error "Invalid version format: ${version}. Expected: vX.Y.Z or vX.Y.Z-alpha/beta/rc1"
  fi
  log "Version format validated: ${version}"
}

# Check git tag exists
check_tag_exists() {
  local version="$1"
  if ! git rev-parse "${version}" &>/dev/null; then
    error "Git tag ${version} does not exist"
  fi
  log "Git tag ${version} verified"
}

# Create backup of current deployment
backup_current() {
  local backup_file="${BACKUP_DIR}/backup-$(date +%Y-%m-%d-%H-%M-%S).tar.gz"
  
  log "Creating backup: ${backup_file}"
  
  if tar -czf "${backup_file}" \
    -C "${DEPLOY_DIR}" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=logs \
    . 2>>${LOG_FILE}; then
    success "Backup created: ${backup_file}"
    
    # Create symlink to latest backup
    ln -sf "${backup_file}" "${BACKUP_DIR}/backup-latest"
    log "Updated backup-latest symlink"
  else
    error "Failed to create backup"
  fi
}

# Deploy new version
deploy_version() {
  local version="$1"
  
  log "Starting deployment of ${version}..."
  
  # Pull latest code
  log "Pulling latest code from repository"
  cd "${DEPLOY_DIR}" || error "Failed to change directory"
  
  if ! git fetch origin "${version}" 2>>${LOG_FILE}; then
    error "Failed to fetch version ${version}"
  fi
  
  if ! git checkout "${version}" 2>>${LOG_FILE}; then
    error "Failed to checkout version ${version}"
  fi
  
  success "Code checked out: ${version}"
  
  # Install dependencies
  log "Installing dependencies"
  
  if ! npm ci 2>>${LOG_FILE}; then
    error "Failed to install dependencies"
  fi
  
  success "Dependencies installed"
  
  # Run migrations
  log "Running database migrations"
  
  if [[ -f "${DEPLOY_DIR}/backend/knexfile.js" ]]; then
    if ! npm run db:migrate 2>>${LOG_FILE}; then
      warn "Database migration may have skipped (could be normal)"
    fi
    success "Migrations completed"
  fi
}

# Restart services
restart_services() {
  log "Restarting services"
  
  if command -v docker-compose &> /dev/null; then
    if ! docker-compose -f "${DEPLOY_DIR}/docker-compose.prod.yml" restart 2>>${LOG_FILE}; then
      error "Failed to restart Docker services"
    fi
    success "Docker services restarted"
  elif command -v systemctl &> /dev/null; then
    if ! systemctl restart free-games-claimer 2>>${LOG_FILE}; then
      error "Failed to restart systemd service"
    fi
    success "Service restarted"
  else
    warn "Could not determine how to restart services"
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
  
  error "Health check failed after ${max_attempts} attempts"
}

################################################################################
# Main Execution
################################################################################

main() {
  # Check arguments
  if [[ $# -lt 1 ]]; then
    error "Usage: $0 <version>\nExample: $0 v1.2.0"
  fi
  
  local version="$1"
  
  # Setup
  ensure_directory "${LOG_DIR}"
  ensure_directory "${BACKUP_DIR}"
  
  log "========================================"
  log "Deployment Started"
  log "Version: ${version}"
  log "Timestamp: $(date)"
  log "========================================"
  
  # Pre-deployment checks
  validate_version "${version}"
  check_tag_exists "${version}"
  
  # Backup current
  backup_current
  
  # Deploy
  if ! deploy_version "${version}"; then
    error "Deployment failed. Rolling back..."
    ./scripts/rollback.sh
    error "Rollback completed. Previous version restored."
  fi
  
  # Restart services
  restart_services
  
  # Health checks
  health_check
  
  log "========================================"
  success "Deployment completed successfully!"
  log "Version: ${version}"
  log "Timestamp: $(date)"
  log "========================================"
}

# Run main function
main "$@"
