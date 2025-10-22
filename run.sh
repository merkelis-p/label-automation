#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display usage
usage() {
    echo -e "${BLUE}Usage:${NC}"
    echo -e "  ./run.sh dev         - Run in development mode"
    echo -e "  ./run.sh prod        - Run in production mode (foreground)"
    echo -e "  ./run.sh start       - Start in background with PM2"
    echo -e "  ./run.sh stop        - Stop PM2 process"
    echo -e "  ./run.sh restart     - Restart PM2 process"
    echo -e "  ./run.sh status      - Show PM2 status"
    echo -e "  ./run.sh logs        - Show PM2 logs"
    echo -e "  ./run.sh build       - Build for production"
    echo ""
}

# Function to check if .env exists
check_env() {
    if [ ! -f .env ]; then
        echo -e "${RED}❌ Error: .env file not found!${NC}"
        echo -e "${YELLOW}Run ./setup.sh first to configure your environment.${NC}"
        exit 1
    fi
}

# Function to run in development mode
run_dev() {
    echo -e "${BLUE}🚀 Starting in DEVELOPMENT mode...${NC}"
    check_env
    
    # Kill any existing processes on ports 3000 and 5173
    echo -e "${YELLOW}Checking for existing processes...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    
    echo -e "${GREEN}✓ Starting backend and frontend...${NC}"
    npm run dev
}

# Function to build for production
run_build() {
    echo -e "${BLUE}🔨 Building for PRODUCTION...${NC}"
    check_env
    
    echo -e "${YELLOW}Building frontend...${NC}"
    cd frontend && npm run build && cd ..
    
    echo -e "${YELLOW}Building backend...${NC}"
    npm run build
    
    echo -e "${GREEN}✓ Build complete!${NC}"
    echo -e "${BLUE}Run './run.sh prod' to start in production mode${NC}"
}

# Function to run in production mode
run_prod() {
    echo -e "${BLUE}🚀 Starting in PRODUCTION mode...${NC}"
    check_env
    
    # Check if build exists
    if [ ! -d "backend/dist" ]; then
        echo -e "${RED}❌ Error: Production build not found!${NC}"
        echo -e "${YELLOW}Run './run.sh build' first.${NC}"
        exit 1
    fi
    
    # Kill any existing processes
    echo -e "${YELLOW}Checking for existing processes...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    echo -e "${GREEN}✓ Starting production server...${NC}"
    NODE_ENV=production npm start
}

# Function to start with PM2 (background)
start_pm2() {
    echo -e "${BLUE}🚀 Starting with PM2 (background)...${NC}"
    check_env
    
    # Check if build exists
    if [ ! -d "backend/dist" ]; then
        echo -e "${RED}❌ Error: Production build not found!${NC}"
        echo -e "${YELLOW}Run './run.sh build' first.${NC}"
        exit 1
    fi
    
    # Start with PM2
    pm2 start ecosystem.config.cjs
    
    echo -e "${GREEN}✓ Application started in background${NC}"
    echo -e "${BLUE}Use './run.sh logs' to view logs${NC}"
    echo -e "${BLUE}Use './run.sh status' to check status${NC}"
}

# Function to stop PM2
stop_pm2() {
    echo -e "${YELLOW}Stopping PM2 process...${NC}"
    pm2 stop label-automation
    echo -e "${GREEN}✓ Application stopped${NC}"
}

# Function to restart PM2
restart_pm2() {
    echo -e "${YELLOW}Restarting PM2 process...${NC}"
    pm2 restart label-automation
    echo -e "${GREEN}✓ Application restarted${NC}"
}

# Function to show PM2 status
status_pm2() {
    pm2 status label-automation
}

# Function to show PM2 logs
logs_pm2() {
    echo -e "${BLUE}📋 Showing logs (Ctrl+C to exit)...${NC}"
    pm2 logs label-automation
}

# Function to stop all processes
stop_all() {
    echo -e "${YELLOW}Stopping all processes...${NC}"
    
    # Stop PM2 if running
    pm2 stop label-automation 2>/dev/null || true
    
    # Kill processes on ports 3000 and 5173
    lsof -ti:3000 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✓ Stopped backend (port 3000)${NC}" || echo -e "${BLUE}No backend process running${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✓ Stopped frontend (port 5173)${NC}" || echo -e "${BLUE}No frontend process running${NC}"
    
    echo -e "${GREEN}✓ All processes stopped${NC}"
}

# Main script logic
case "$1" in
    dev)
        run_dev
        ;;
    prod)
        run_prod
        ;;
    start)
        start_pm2
        ;;
    stop)
        stop_pm2
        ;;
    restart)
        restart_pm2
        ;;
    status)
        status_pm2
        ;;
    logs)
        logs_pm2
        ;;
    build)
        run_build
        ;;
    *)
        echo -e "${RED}❌ Invalid command${NC}"
        echo ""
        usage
        exit 1
        ;;
esac
