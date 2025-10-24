#!/bin/bash

# =============================================================================
# Quick Fix Script for macOS 10.13.6 High Sierra
# =============================================================================
#
# This script adapts the label-automation system for older macOS versions
# by adjusting Node.js version requirements and providing workarounds.
#
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     macOS 10.13.6 High Sierra - Quick Fix Script          ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Detect macOS version
MACOS_VERSION=$(sw_vers -productVersion)
echo -e "${YELLOW}Detected macOS version: $MACOS_VERSION${NC}"
echo ""

# Check current Node.js version
if command -v node &> /dev/null; then
    CURRENT_NODE=$(node -v)
    echo -e "${YELLOW}Current Node.js version: $CURRENT_NODE${NC}"
else
    echo -e "${RED}Node.js is not installed${NC}"
    echo ""
    echo "Please install Node.js v16.20.2 from:"
    echo "https://nodejs.org/dist/v16.20.2/node-v16.20.2.pkg"
    echo ""
    exit 1
fi

# Extract major version
NODE_MAJOR=$(echo $CURRENT_NODE | cut -d'.' -f1 | sed 's/v//')

echo ""
echo -e "${BLUE}Analyzing your system...${NC}"
echo ""

# Provide recommendations based on Node.js version
if [ "$NODE_MAJOR" -ge 18 ]; then
    echo -e "${GREEN}✅ Node.js version is compatible ($CURRENT_NODE)${NC}"
    echo "You can proceed with normal setup:"
    echo "  ./setup.sh"
    echo ""
    exit 0
elif [ "$NODE_MAJOR" -eq 16 ]; then
    echo -e "${YELLOW}⚠️  Node.js v16 detected - adjusting project configuration...${NC}"
    echo ""
    
    # Backup and modify package.json
    if [ -f "package.json" ]; then
        echo "📝 Updating package.json to allow Node.js v16..."
        cp package.json package.json.backup
        sed -i '' 's/">=18.0.0"/">=16.0.0"/' package.json || sed -i 's/">=18.0.0"/">=16.0.0"/' package.json
        echo -e "${GREEN}✅ package.json updated${NC}"
    fi
    
    # Backup and modify setup.sh
    if [ -f "setup.sh" ]; then
        echo "📝 Updating setup.sh to allow Node.js v16..."
        cp setup.sh setup.sh.backup
        sed -i '' 's/NODE_MAJOR" -lt 18/NODE_MAJOR" -lt 16/' setup.sh || sed -i 's/NODE_MAJOR" -lt 18/NODE_MAJOR" -lt 16/' setup.sh
        echo -e "${GREEN}✅ setup.sh updated${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}✅ Configuration adjusted for Node.js v16${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Clean install: rm -rf node_modules frontend/node_modules"
    echo "  2. Install deps: npm install && cd frontend && npm install && cd .."
    echo "  3. Run setup: ./setup.sh"
    echo ""
    
elif [ "$NODE_MAJOR" -eq 17 ]; then
    echo -e "${RED}❌ Node.js v17 has compatibility issues${NC}"
    echo ""
    echo "Node.js v17.x is not recommended and causes module errors."
    echo ""
    echo "🔧 Recommended fix:"
    echo ""
    echo "1. Download and install Node.js v16.20.2:"
    echo "   https://nodejs.org/dist/v16.20.2/node-v16.20.2.pkg"
    echo ""
    echo "2. After installation, verify:"
    echo "   node -v  # Should show v16.20.2"
    echo ""
    echo "3. Then run this script again:"
    echo "   ./fix-old-mac.sh"
    echo ""
    exit 1
    
else
    echo -e "${RED}❌ Node.js version is too old ($CURRENT_NODE)${NC}"
    echo ""
    echo "Minimum required: Node.js v16.0.0"
    echo "Recommended: Node.js v16.20.2 (for macOS 10.13.6)"
    echo ""
    echo "📥 Download Node.js v16.20.2:"
    echo "   https://nodejs.org/dist/v16.20.2/node-v16.20.2.pkg"
    echo ""
    exit 1
fi

# Optional: Clean install
echo ""
read -p "Do you want to clean and reinstall node_modules? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Cleaning old installations..."
    rm -rf node_modules
    rm -rf frontend/node_modules
    rm -rf package-lock.json
    rm -rf frontend/package-lock.json
    echo -e "${GREEN}✅ Cleaned${NC}"
    
    echo ""
    echo "📦 Installing dependencies..."
    npm install
    
    echo ""
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    
    echo ""
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Setup complete! You can now run:${NC}"
echo ""
echo "  ./setup.sh      # Run the setup wizard"
echo "  ./run.sh dev    # Start in development mode"
echo ""
echo -e "${YELLOW}Note: For production mode, install PM2:${NC}"
echo "  npm install -g pm2"
echo "  (or: sudo npm install -g pm2)"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
