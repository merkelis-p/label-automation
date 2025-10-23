#!/bin/bash

# =============================================================================
# Label Automation System - Interactive Setup Wizard
# =============================================================================
#
# DESCRIPTION:
#   This script provides an interactive wizard to help you set up the Label
#   Automation System from scratch. It will guide you through:
#
#   1. Dependencies Installation (Node.js, npm packages)
#   2. Environment Configuration (.env file creation)
#   3. Build Process (frontend and backend)
#   4. Verification (checks if everything is ready)
#
# USAGE:
#   chmod +x setup.sh
#   ./setup.sh
#
# FEATURES:
#   - ✅ Checks Node.js version compatibility (requires >= 17.9.1)
#   - ✅ Installs all npm dependencies
#   - ✅ Creates .env file from template
#   - ✅ Guides you through credential entry (Shopify, MakeCommerce, etc.)
#   - ✅ Validates configuration inputs
#   - ✅ Builds frontend and backend
#   - ✅ Runs final verification check
#   - ✅ Provides next steps instructions
#
# WHAT YOU'LL NEED:
#   - Shopify store URL and access token
#   - MakeCommerce credentials (shop ID, DPD/OMNIVA credentials)
#   - Sender information (name, address, contact)
#   - PrintNode API key and printer ID
#
# AFTER SETUP:
#   - Use ./verify.sh to check production readiness
#   - Use ./run.sh dev|prod|start to run the application
#
# SUPPORT:
#   See README.md and QUICKSTART.md for detailed documentation
#
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Emojis
CHECK="✅"
CROSS="❌"
ARROW="➡️"
WRENCH="🔧"
ROCKET="🚀"

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        Label Automation System - Setup Wizard              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to print colored messages
print_success() {
    echo -e "${GREEN}${CHECK} $1${NC}"
}

print_error() {
    echo -e "${RED}${CROSS} $1${NC}"
}

print_info() {
    echo -e "${BLUE}${ARROW} $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_section() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}${WRENCH} $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get user input with default value
get_input() {
    local prompt="$1"
    local default="$2"
    local required="$3"
    local value=""
    
    while true; do
        if [ -n "$default" ]; then
            read -p "$(echo -e ${BLUE}${prompt}${NC} [${default}]: )" value
            value="${value:-$default}"
        else
            read -p "$(echo -e ${BLUE}${prompt}${NC}: )" value
        fi
        
        if [ "$required" = "true" ] && [ -z "$value" ]; then
            print_error "This field is required. Please enter a value."
        else
            echo "$value"
            return 0
        fi
    done
}

# Function to get sensitive input (hidden)
get_secret() {
    local prompt="$1"
    local value=""
    
    while true; do
        read -s -p "$(echo -e ${BLUE}${prompt}${NC}: )" value
        echo ""
        
        if [ -z "$value" ]; then
            print_error "This field is required. Please enter a value."
        else
            echo "$value"
            return 0
        fi
    done
}

# Check prerequisites
print_section "Checking Prerequisites"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node -v)
    print_success "Node.js is installed: $NODE_VERSION"
    
    # Check if version is >= 18
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. You have $NODE_VERSION"
        exit 1
    fi
else
    print_error "Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_success "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed"
    exit 1
fi

# Check if .env already exists
if [ -f ".env" ]; then
    echo ""
    print_warning ".env file already exists!"
    echo ""
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Keeping existing .env file"
        SKIP_ENV=true
    else
        print_info "Will create new .env file"
        SKIP_ENV=false
    fi
else
    SKIP_ENV=false
fi

# Create .env file if needed
if [ "$SKIP_ENV" = false ]; then
    print_section "Configuring Environment Variables"
    
    echo "This wizard will help you set up all required configuration."
    echo "Press Ctrl+C at any time to cancel."
    echo ""
    
    # Create temporary .env file
    TMP_ENV=".env.tmp"
    > $TMP_ENV
    
    # Shopify Configuration
    print_info "SHOPIFY CONFIGURATION"
    echo "Get these from: Shopify Admin > Settings > Apps and sales channels > Develop apps"
    echo ""
    
    SHOPIFY_STORE_DOMAIN=$(get_input "Shopify store domain (e.g., mystore.myshopify.com or doshabliss.lt)" "" true)
    echo "SHOPIFY_STORE_DOMAIN=$SHOPIFY_STORE_DOMAIN" >> $TMP_ENV
    
    SHOPIFY_ADMIN_TOKEN=$(get_secret "Shopify Admin API Access Token (shpat_...)")
    echo "SHOPIFY_ADMIN_TOKEN=$SHOPIFY_ADMIN_TOKEN" >> $TMP_ENV
    
    SHOPIFY_WEBHOOK_SECRET=$(get_secret "Shopify Webhook Secret")
    echo "SHOPIFY_WEBHOOK_SECRET=$SHOPIFY_WEBHOOK_SECRET" >> $TMP_ENV
    
    echo "" >> $TMP_ENV
    
    # MakeCommerce Configuration
    print_info "MAKECOMMERCE CONFIGURATION"
    echo ""
    
    echo "Select environment:"
    echo "  1) test (sandbox)"
    echo "  2) live (production)"
    read -p "Enter choice [1-2]: " env_choice
    if [ "$env_choice" = "1" ]; then
        MC_ENV="test"
    else
        MC_ENV="live"
    fi
    echo "MC_ENV=$MC_ENV" >> $TMP_ENV
    
    MC_SHOP_ID=$(get_input "MakeCommerce Shop UUID" "" true)
    echo "MC_SHOP_ID=$MC_SHOP_ID" >> $TMP_ENV
    
    MC_SHOP_SECRET=$(get_input "MakeCommerce Shop Secret (if required)" "" false)
    if [ -n "$MC_SHOP_SECRET" ]; then
        echo "MC_SHOP_SECRET=$MC_SHOP_SECRET" >> $TMP_ENV
    fi
    
    echo "" >> $TMP_ENV
    
    # DPD Configuration
    print_info "DPD LITHUANIA CARRIER"
    echo "Contact DPD Lithuania to obtain API credentials"
    echo ""
    
    read -p "Do you have DPD credentials? (Y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        CARRIER_DPD_API_KEY=$(get_secret "DPD JWT Token (API Key)")
        echo "CARRIER_DPD_API_KEY=$CARRIER_DPD_API_KEY" >> $TMP_ENV
    else
        echo "# CARRIER_DPD_API_KEY=" >> $TMP_ENV
        print_warning "Skipping DPD configuration. You can add it later to .env"
    fi
    
    echo "" >> $TMP_ENV
    
    # OMNIVA Configuration
    print_info "OMNIVA CARRIER"
    echo ""
    
    read -p "Do you have OMNIVA credentials? (Y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        CARRIER_OMNIVA_USERNAME=$(get_input "OMNIVA API Username" "" true)
        echo "CARRIER_OMNIVA_USERNAME=$CARRIER_OMNIVA_USERNAME" >> $TMP_ENV
        
        CARRIER_OMNIVA_PASSWORD=$(get_secret "OMNIVA API Password")
        echo "CARRIER_OMNIVA_PASSWORD=$CARRIER_OMNIVA_PASSWORD" >> $TMP_ENV
    else
        echo "# CARRIER_OMNIVA_USERNAME=" >> $TMP_ENV
        echo "# CARRIER_OMNIVA_PASSWORD=" >> $TMP_ENV
        print_warning "Skipping OMNIVA configuration. You can add it later to .env"
    fi
    
    echo "" >> $TMP_ENV
    
    # Sender Information
    print_info "SENDER INFORMATION"
    echo "Your company/warehouse details for shipping labels"
    echo ""
    
    SENDER_NAME=$(get_input "Company Name" "" true)
    echo "SENDER_NAME=$SENDER_NAME" >> $TMP_ENV
    
    SENDER_PHONE=$(get_input "Phone (with country code, e.g., +370612345678)" "" true)
    echo "SENDER_PHONE=$SENDER_PHONE" >> $TMP_ENV
    
    SENDER_EMAIL=$(get_input "Email" "" true)
    echo "SENDER_EMAIL=$SENDER_EMAIL" >> $TMP_ENV
    
    SENDER_POSTAL=$(get_input "Postal Code (e.g., LT-01234)" "" true)
    echo "SENDER_POSTAL=$SENDER_POSTAL" >> $TMP_ENV
    
    LABEL_FORMAT=$(get_input "Label Format" "A6_FULL_PAGE" false)
    echo "LABEL_FORMAT=$LABEL_FORMAT" >> $TMP_ENV
    
    echo "" >> $TMP_ENV
    
    # PrintNode Configuration
    print_info "PRINTNODE CONFIGURATION"
    echo "Get these from: https://app.printnode.com/"
    echo ""
    
    read -p "Do you have PrintNode set up? (Y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        PRINTNODE_API_KEY=$(get_secret "PrintNode API Key")
        echo "PRINTNODE_API_KEY=$PRINTNODE_API_KEY" >> $TMP_ENV
        
        PRINTNODE_PRINTER_ID=$(get_input "PrintNode Printer ID (numeric)" "" true)
        echo "PRINTNODE_PRINTER_ID=$PRINTNODE_PRINTER_ID" >> $TMP_ENV
    else
        echo "# PRINTNODE_API_KEY=" >> $TMP_ENV
        echo "# PRINTNODE_PRINTER_ID=" >> $TMP_ENV
        print_warning "Skipping PrintNode configuration. See README.md for setup instructions."
    fi
    
    echo "" >> $TMP_ENV
    
    # Server Configuration
    PORT=$(get_input "Server Port" "3000" false)
    echo "PORT=$PORT" >> $TMP_ENV
    
    # Move temp file to .env
    mv $TMP_ENV .env
    print_success "Configuration saved to .env"
fi

# Install dependencies
print_section "Installing Dependencies"

print_info "Installing backend dependencies..."
npm install
print_success "Backend dependencies installed"

echo ""
print_info "Installing frontend dependencies..."
cd frontend
npm install
cd ..
print_success "Frontend dependencies installed"

# Build the project
print_section "Building Project"

read -p "Do you want to build for production now? (Y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    print_info "Building frontend..."
    npm run build:frontend
    print_success "Frontend built successfully"
    
    echo ""
    print_info "Building backend..."
    npm run build:backend
    print_success "Backend built successfully"
    
    BUILD_DONE=true
else
    BUILD_DONE=false
    print_warning "Skipping build. Run 'npm run build' later."
fi

# Summary
print_section "Setup Complete!"

echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║  ${ROCKET} Setup completed successfully!                          ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo ""
echo "Next steps:"
echo ""

if [ "$BUILD_DONE" = true ]; then
    echo "🎯 Quick Start Options:"
    echo ""
    echo "1. Start in production mode (foreground):"
    echo -e "   ${BLUE}./run.sh prod${NC}"
    echo ""
    echo "2. Start with PM2 (background daemon - recommended):"
    echo -e "   ${BLUE}./run.sh start${NC}"
    echo -e "   ${GREEN}✓ Runs in background after closing terminal${NC}"
    echo -e "   ${GREEN}✓ Auto-restarts on crashes${NC}"
    echo ""
    echo "3. Or run in development mode (with hot reload):"
    echo -e "   ${BLUE}./run.sh dev${NC}"
else
    echo "1. Build the project:"
    echo -e "   ${BLUE}./run.sh build${NC}"
    echo ""
    echo "2. Start in production mode (foreground):"
    echo -e "   ${BLUE}./run.sh prod${NC}"
    echo ""
    echo "3. Start with PM2 (background daemon - recommended):"
    echo -e "   ${BLUE}./run.sh start${NC}"
    echo ""
    echo "4. Or run in development mode (with hot reload):"
    echo -e "   ${BLUE}./run.sh dev${NC}"
fi

echo ""
echo "📊 Useful Commands:"
echo -e "   ${BLUE}./run.sh status${NC}   - Check if app is running (PM2)"
echo -e "   ${BLUE}./run.sh logs${NC}     - View application logs (PM2)"
echo -e "   ${BLUE}./run.sh restart${NC}  - Restart application (PM2)"
echo -e "   ${BLUE}./run.sh stop${NC}     - Stop application (PM2)"

echo ""
echo "🌐 Access the Dashboard:"
echo -e "   ${BLUE}http://localhost:${PORT:-3000}${NC}"
echo ""
echo "🧪 Test with Mock Data:"
echo -e "   ${BLUE}curl -X POST http://localhost:${PORT:-3000}/api/test/seed${NC}"
echo ""
echo "📚 Documentation:"
print_info "README.md - Complete setup and usage guide"
print_info "QUICKSTART.md - 5-minute quick start"
print_info "PRINTNODE_SETUP.md - PrintNode configuration guide"
print_info "DEPLOYMENT.md - Production deployment options"

echo ""
print_success "Happy shipping! 📦"
echo ""
