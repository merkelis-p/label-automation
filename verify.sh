#!/bin/bash

# Project Verification Script
# Checks if all production-ready components are in place

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CHECK="✅"
CROSS="❌"
WARN="⚠️"

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         Label Automation - Production Verification         ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

ERRORS=0
WARNINGS=0

# Function to check file exists
check_file() {
    local file="$1"
    local name="$2"
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}${CHECK} $name${NC}"
    else
        echo -e "${RED}${CROSS} $name - MISSING${NC}"
        ((ERRORS++))
    fi
}

# Function to check directory exists
check_dir() {
    local dir="$1"
    local name="$2"
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}${CHECK} $name${NC}"
    else
        echo -e "${RED}${CROSS} $name - MISSING${NC}"
        ((ERRORS++))
    fi
}

# Function to check executable
check_executable() {
    local file="$1"
    local name="$2"
    
    if [ -x "$file" ]; then
        echo -e "${GREEN}${CHECK} $name${NC}"
    else
        echo -e "${YELLOW}${WARN} $name - Not executable${NC}"
        ((WARNINGS++))
    fi
}

echo -e "${BLUE}=== Documentation ===${NC}"
check_file "README.md" "README.md"
check_file "QUICKSTART.md" "QUICKSTART.md"
check_file "DEPLOYMENT.md" "DEPLOYMENT.md"
check_file "PRINTNODE_SETUP.md" "PRINTNODE_SETUP.md"
check_file "LICENSE" "LICENSE"

echo ""
echo -e "${BLUE}=== Configuration ===${NC}"
check_file ".env.example" ".env.example"
check_file ".gitignore" ".gitignore"
check_file "package.json" "package.json"
check_executable "setup.sh" "setup.sh"

echo ""
echo -e "${BLUE}=== Backend Structure ===${NC}"
check_dir "backend" "backend/"
check_dir "backend/src" "backend/src/"
check_dir "backend/src/config" "backend/src/config/"
check_dir "backend/src/types" "backend/src/types/"
check_dir "backend/src/services" "backend/src/services/"
check_dir "backend/src/middleware" "backend/src/middleware/"
check_dir "backend/src/controllers" "backend/src/controllers/"
check_dir "backend/src/routes" "backend/src/routes/"
check_file "backend/src/server.ts" "backend/src/server.ts"
check_file "backend/src/websocket.ts" "backend/src/websocket.ts"
check_file "backend/src/store.ts" "backend/src/store.ts"
check_file "backend/tsconfig.json" "backend/tsconfig.json"

echo ""
echo -e "${BLUE}=== Frontend Structure ===${NC}"
check_dir "frontend" "frontend/"
check_dir "frontend/src" "frontend/src/"
check_dir "frontend/src/components" "frontend/src/components/"
check_dir "frontend/src/components/ui" "frontend/src/components/ui/"
check_dir "frontend/src/hooks" "frontend/src/hooks/"
check_dir "frontend/src/types" "frontend/src/types/"
check_file "frontend/src/App.tsx" "frontend/src/App.tsx"
check_file "frontend/src/main.tsx" "frontend/src/main.tsx"
check_file "frontend/package.json" "frontend/package.json"
check_file "frontend/vite.config.ts" "frontend/vite.config.ts"
check_file "frontend/tailwind.config.js" "frontend/tailwind.config.js"
check_file "frontend/tsconfig.json" "frontend/tsconfig.json"

echo ""
echo -e "${BLUE}=== Dependencies Check ===${NC}"

if [ -d "node_modules" ]; then
    echo -e "${GREEN}${CHECK} Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}${WARN} Backend dependencies not installed - Run: npm install${NC}"
    ((WARNINGS++))
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}${CHECK} Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}${WARN} Frontend dependencies not installed - Run: cd frontend && npm install${NC}"
    ((WARNINGS++))
fi

echo ""
echo -e "${BLUE}=== Build Verification ===${NC}"

if [ -d "backend/dist" ]; then
    echo -e "${GREEN}${CHECK} Backend built${NC}"
else
    echo -e "${YELLOW}${WARN} Backend not built - Run: npm run build:backend${NC}"
    ((WARNINGS++))
fi

if [ -d "frontend/dist" ]; then
    echo -e "${GREEN}${CHECK} Frontend built${NC}"
else
    echo -e "${YELLOW}${WARN} Frontend not built - Run: npm run build:frontend${NC}"
    ((WARNINGS++))
fi

echo ""
echo -e "${BLUE}=== Environment Configuration ===${NC}"

if [ -f ".env" ]; then
    echo -e "${GREEN}${CHECK} .env file exists${NC}"
    
    # Check critical env vars (using correct variable names)
    if grep -q "SHOPIFY_STORE_DOMAIN=" .env && ! grep -q "SHOPIFY_STORE_DOMAIN=$" .env; then
        echo -e "${GREEN}${CHECK} SHOPIFY_STORE_DOMAIN configured${NC}"
    else
        echo -e "${YELLOW}${WARN} SHOPIFY_STORE_DOMAIN not set${NC}"
        ((WARNINGS++))
    fi
    
    if grep -q "SHOPIFY_ADMIN_TOKEN=" .env && ! grep -q "SHOPIFY_ADMIN_TOKEN=$" .env; then
        echo -e "${GREEN}${CHECK} SHOPIFY_ADMIN_TOKEN configured${NC}"
    else
        echo -e "${YELLOW}${WARN} SHOPIFY_ADMIN_TOKEN not set${NC}"
        ((WARNINGS++))
    fi
    
    if grep -q "PRINTNODE_API_KEY=" .env && ! grep -q "PRINTNODE_API_KEY=$" .env; then
        echo -e "${GREEN}${CHECK} PRINTNODE_API_KEY configured${NC}"
    else
        echo -e "${YELLOW}${WARN} PRINTNODE_API_KEY not set${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}${CROSS} .env file missing - Copy .env.example or run ./setup.sh${NC}"
    ((ERRORS++))
fi

echo ""
echo -e "${BLUE}=== Git Configuration ===${NC}"

if [ -d ".git" ]; then
    echo -e "${GREEN}${CHECK} Git repository initialized${NC}"
    
    # Check if .env is ignored
    if grep -q "^\.env$" .gitignore 2>/dev/null; then
        echo -e "${GREEN}${CHECK} .env properly ignored in .gitignore${NC}"
    else
        echo -e "${RED}${CROSS} .env not in .gitignore - Security risk!${NC}"
        ((ERRORS++))
    fi
else
    echo -e "${YELLOW}${WARN} Not a git repository - Run: git init${NC}"
    ((WARNINGS++))
fi

echo ""
echo -e "${BLUE}=== Summary ===${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║  ✅ ALL CHECKS PASSED - PRODUCTION READY! 🚀               ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Your Label Automation System is ready for deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review DEPLOYMENT.md for production setup"
    echo "  2. Configure Shopify webhooks with production URL"
    echo "  3. Set up PrintNode on production server"
    echo "  4. Run one of the following commands: "
    echo "     4.1. ./run.sh dev - for development mode"
    echo "     4.2. ./run.sh prod - for production mode (foreground)"
    echo "     4.3. ./run.sh start - to start the application"
    echo ""
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║                                                            ║${NC}"
    echo -e "${YELLOW}║  ⚠️  $WARNINGS WARNING(S) FOUND                                     ║${NC}"
    echo -e "${YELLOW}║                                                            ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}System is functional but has some warnings.${NC}"
    echo -e "${YELLOW}Review the warnings above before deploying.${NC}"
    echo ""
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                            ║${NC}"
    echo -e "${RED}║  ❌ $ERRORS ERROR(S) FOUND.                                    ║${NC}"
    echo -e "${RED}║                                                            ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}System is not ready for deployment.${NC}"
    echo -e "${RED}Please fix the errors above.${NC}"
    echo ""
    exit 1
fi
