#!/bin/bash

# PaulClean Admin Frontend Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Environment: staging (default) or production

set -e

# Configuration
ENVIRONMENT=${1:-staging}
SERVER_HOST="165.22.43.35"
SERVER_USER="root"
DEPLOY_PATH="/var/www/admin.paulcleanwa.com"
BACKUP_DIR="/opt/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "Please run this script from the project root directory"
    exit 1
fi

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ]; then
    log_error "SSH key not found at ~/.ssh/id_rsa"
    log_info "Please ensure your SSH key is properly configured"
    exit 1
fi

log_info "Starting deployment to $ENVIRONMENT environment..."

# Build the application
log_info "Installing dependencies..."
npm install

log_info "Running linter..."
# Debug node_modules structure
log_info "Checking node_modules structure..."
ls -la node_modules/ | head -10
log_info "Checking for ESLint packages..."
ls -la node_modules/@typescript-eslint/ 2>/dev/null || log_warning "@typescript-eslint not found"
ls -la node_modules/eslint-plugin-react/ 2>/dev/null || log_warning "eslint-plugin-react not found"

# Install ESLint dependencies if not present
if [ ! -d "node_modules/@typescript-eslint" ] || [ ! -d "node_modules/eslint-plugin-react" ]; then
    log_info "Installing ESLint dependencies..."
    npm install @typescript-eslint/eslint-plugin@^6.21.0 @typescript-eslint/parser@^6.21.0 eslint-plugin-react@^7.34.0 eslint-plugin-react-hooks@^4.6.0
    log_success "ESLint dependencies installed"
else
    log_success "ESLint dependencies already present"
fi

log_info "Verifying ESLint installation..."
npx eslint --version
log_info "Running ESLint with debug info..."
npm run lint

log_info "Building application..."
npm run build

# Create deployment archive
log_info "Creating deployment archive..."
cd dist
tar -czf ../admin-frontend.tar.gz .
cd ..

# Upload and deploy
log_info "Uploading to server..."
scp admin-frontend.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/

log_info "Deploying on server..."
ssh $SERVER_USER@$SERVER_HOST "
    set -e
    
    # Create backup
    BACKUP_DIR=\"$BACKUP_DIR/admin_frontend_\$(date +%Y%m%d_%H%M%S)\"
    mkdir -p \"\$BACKUP_DIR\"
    if [ -d \"$DEPLOY_PATH\" ]; then
        cp -r $DEPLOY_PATH/* \"\$BACKUP_DIR/\" 2>/dev/null || true
        echo \"Backup created at \$BACKUP_DIR\"
    fi
    
    # Stop nginx
    systemctl stop nginx || true
    
    # Clean old version
    rm -rf $DEPLOY_PATH/*
    
    # Extract new version
    cd $DEPLOY_PATH
    tar -xzf /tmp/admin-frontend.tar.gz
    
    # Set permissions
    chown -R www-data:www-data $DEPLOY_PATH
    chmod -R 755 $DEPLOY_PATH
    
    # Start nginx
    systemctl start nginx
    
    # Cleanup
    rm -f /tmp/admin-frontend.tar.gz
    
    echo \"Deployment completed successfully\"
"

# Cleanup local archive
rm -f admin-frontend.tar.gz

# Verify deployment
log_info "Verifying deployment..."
sleep 5

if curl -f -s https://admin.paulcleanwa.com > /dev/null; then
    log_success "Deployment verification successful!"
    log_success "Admin panel is available at: https://admin.paulcleanwa.com"
else
    log_warning "Deployment verification failed. Please check the server manually."
fi

log_success "Deployment completed!"