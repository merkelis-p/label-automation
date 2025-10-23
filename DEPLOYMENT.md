# 🚀 Production Deployment Guide

Complete guide for deploying the Label Automation System to production environments.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Requirements](#server-requirements)
3. [Deployment Options](#deployment-options)
4. [Option 1: VPS Deployment](#option-1-vps-deployment)
5. [Option 2: Docker Deployment](#option-2-docker-deployment)
6. [Option 3: Cloud Platforms](#option-3-cloud-platforms)
7. [Reverse Proxy Setup](#reverse-proxy-setup)
8. [SSL/TLS Configuration](#ssltls-configuration)
9. [Process Management](#process-management)
10. [Environment Variables](#environment-variables)
11. [Monitoring & Logging](#monitoring--logging)
12. [Backup Strategy](#backup-strategy)
13. [Security Hardening](#security-hardening)
14. [Performance Optimization](#performance-optimization)
15. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before deploying to production:

- ✅ Domain name (e.g., `labels.yourcompany.com`)
- ✅ Server with Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- ✅ Root or sudo access
- ✅ Valid SSL certificate (Let's Encrypt recommended)
- ✅ All API credentials (Shopify, MakeCommerce, PrintNode)
- ✅ Application tested locally

---

## 🖥️ Server Requirements

### Minimum Specs
- **CPU**: 2 cores
- **RAM**: 2GB
- **Storage**: 20GB SSD
- **Bandwidth**: 100Mbps
- **OS**: Linux (Ubuntu 20.04+ recommended)

### Recommended Specs
- **CPU**: 4 cores
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **Bandwidth**: 1Gbps
- **OS**: Ubuntu 22.04 LTS

### Software Requirements
- **Node.js 17.9.1+** (Node 18+ LTS recommended for full build support)
  - Node 17.9.1-17.x: Can run using pre-built files
  - Node 18+: Can build and run (recommended)
  - See [Node Version Compatibility](#node-version-compatibility) below
- npm 9+
- Git
- Nginx or Apache (for reverse proxy)
- PM2 (for process management)
- Certbot (for SSL)

---

## 🚀 Deployment Options

### Quick Comparison

| Method | Difficulty | Best For | Key Benefit |
|--------|-----------|----------|-------------|
| **VPS** | ⭐⭐ Medium | Most users | Full control, cost-effective |
| **Docker** | ⭐⭐⭐ Advanced | DevOps teams | Containerized, reproducible |
| **Cloud** | ⭐ Easy | Enterprise | Auto-scaling, managed |

### VPS Deployment (Recommended)

Quick steps:
1. Setup server (Ubuntu 20.04+)
2. Clone repository
3. Run `./setup.sh` (guided setup)
4. Run `./verify.sh` (verify everything)
5. Run `./run.sh build` (build application)
6. Run `./run.sh start` (start with PM2)

Full instructions below ↓

---

## 🖥️ Option 1: VPS Deployment

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS (recommended for production)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# OR install Node.js 18 LTS (minimum recommended)
# curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
# sudo apt install -y nodejs

# Verify installation
node -v  # Should show v18.x.x or v20.x.x
npm -v   # Should show 9.x.x or 10.x.x

# Note: Node 17.9.1+ can run the app, but Node 18+ is recommended for full build support
# See Node Version Compatibility section below for details

# Install Git
sudo apt install -y git

# Install build tools
sudo apt install -y build-essential
```

### Node Version Compatibility

**Important: Choose the right Node.js version for your needs**

| Node Version | Can Run App | Can Build | Recommended For |
|--------------|-------------|-----------|-----------------|
| 17.9.1 - 17.x | ✅ Yes (pre-built) | ❌ No | Running only (not recommended for production) |
| 18.x LTS | ✅ Yes | ✅ Yes | ✅ **Production (Recommended)** |
| 20.x LTS | ✅ Yes | ✅ Yes | ✅ **Production (Latest)** |

**Why Node 18+ is recommended for production:**
- Full build support for updates and customizations
- Can rebuild from source if needed
- Better security and performance
- LTS (Long Term Support) version

**Can I use Node 17.9.1?**
- Yes, the app will run using pre-built files from the repository
- However, you won't be able to build the frontend if you need to update code
- Not recommended for production deployments

**Pre-built files included:**
- `frontend/dist/` - Pre-built React frontend
- `backend/dist/` - Pre-built TypeScript backend
- These allow Node 17.9.1 users to run the app without building

### Step 2: Create Application User

```bash
# Create dedicated user (security best practice)
sudo adduser --system --group --home /opt/label-automation labelapp

# Switch to application user
sudo su - labelapp
```

### Step 3: Clone Repository

```bash
# Clone your repository
git clone https://github.com/merkelis-p/label-automation.git /opt/label-automation
cd /opt/label-automation

# Or upload files via SCP/SFTP
```

### Step 4: Setup Configuration

**Option A: Automated Setup (Recommended)**

```bash
# Run the setup wizard
chmod +x setup.sh run.sh verify.sh
./setup.sh
```

The setup script will:
- Install all dependencies (frontend + backend)
- Guide you through configuration
- Create `.env` file with your credentials
- Build the project
- Verify everything is ready

**Verify the setup:**
```bash
./verify.sh
```

This checks all files, dependencies, builds, and configuration are correct.

**Option B: Manual Setup**

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Copy environment template
cp .env.example .env

# Edit with your credentials
nano .env

# Verify everything is ready
chmod +x verify.sh
./verify.sh
```

See the [Environment Variables](#environment-variables) section below for the correct variable names.

**Secure the file:**
```bash
chmod 600 .env
```

### Step 5: Build Application (if not using setup.sh)

```bash
# Using run.sh
./run.sh build

# Or manually
npm run build
```

### Step 6: Verify Build
```bash
ls -la frontend/dist
ls -la backend/dist
```

### Step 7: Start Application

**Using run.sh (Recommended):**

```bash
# Make executable (if not already)
chmod +x run.sh

# Build for production
./run.sh build

# Option 1: Start in background with PM2 (recommended)
./run.sh start

# Check status
./run.sh status

# View logs
./run.sh logs

# Option 2: Start in foreground (keeps terminal open)
./run.sh prod
```

**Or manually:**

```bash
# Test the built application
npm start

# In another terminal, test the API
curl http://localhost:3000/api/orders
```

**If successful, your application is running!**

> 💡 **Note:** The `run.sh` script handles PM2 process management automatically. See the Process Management section below for more details.

---

## 🐳 Option 2: Docker Deployment

### Step 1: Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci --only=production
RUN cd frontend && npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

CMD ["node", "backend/dist/server.js"]
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  label-automation:
    build: .
    container_name: label-automation
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - .env
    environment:
      - NODE_ENV=production
    volumes:
      - ./labels:/app/labels  # Persist generated labels
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/orders"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### Step 3: Create .dockerignore

```
node_modules
frontend/node_modules
.env
.git
*.log
npm-debug.log*
.DS_Store
labels/*.pdf
backend/dist
frontend/dist
```

### Step 4: Build and Run

```bash
# Build image
docker-compose build

# Start container
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Step 5: Update Deployment

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

---

## ☁️ Option 3: Cloud Platforms

### AWS EC2

1. **Launch EC2 instance**:
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t3.medium (2 vCPU, 4GB RAM)
   - Security Group: Allow ports 22, 80, 443, 3000

2. **Connect via SSH**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Follow VPS deployment steps** (above)

### DigitalOcean Droplet

1. **Create Droplet**:
   - Image: Ubuntu 22.04 x64
   - Plan: Basic $12/mo (2GB RAM)
   - Add SSH key

2. **Connect**:
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Follow VPS deployment steps**

### Heroku

1. **Create `Procfile`**:
   ```
   web: node backend/dist/server.js
   ```

2. **Deploy**:
   ```bash
   heroku login
   heroku create your-app-name
   heroku config:set NODE_ENV=production
   # Set all other env vars
   git push heroku main
   ```

### Vercel / Netlify

**⚠️ Not Recommended**: These platforms are optimized for frontend/serverless, not for WebSocket servers.

---

## 🔀 Reverse Proxy Setup

Using Nginx as a reverse proxy provides:
- SSL termination
- Load balancing
- Static file caching
- Security headers

### Install Nginx

```bash
sudo apt install -y nginx
```

### Configure Nginx

Create `/etc/nginx/sites-available/label-automation`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name labels.yourcompany.com;
    
    # Let's Encrypt validation
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name labels.yourcompany.com;
    
    # SSL certificates (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/labels.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/labels.yourcompany.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Logging
    access_log /var/log/nginx/label-automation-access.log;
    error_log /var/log/nginx/label-automation-error.log;
    
    # Max upload size (for large PDFs)
    client_max_body_size 10M;
    
    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;  # 24 hours for long-lived connections
    }
    
    # API and webhooks
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90s;
    }
    
    location /webhooks {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90s;
        
        # Increase buffer for large webhook payloads
        proxy_buffer_size 16k;
        proxy_buffers 8 16k;
    }
    
    # Frontend static files
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://localhost:3000;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/label-automation /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 SSL/TLS Configuration

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d labels.yourcompany.com

# Test auto-renewal
sudo certbot renew --dry-run
```

Certbot will:
- Obtain SSL certificate
- Update Nginx configuration
- Set up auto-renewal (certificates expire every 90 days)

### Manual Certificate

If you have a paid certificate:

```bash
# Copy certificate files
sudo cp your-cert.crt /etc/ssl/certs/label-automation.crt
sudo cp your-key.key /etc/ssl/private/label-automation.key

# Update Nginx config
ssl_certificate /etc/ssl/certs/label-automation.crt;
ssl_certificate_key /etc/ssl/private/label-automation.key;
```

---

## 🔄 Process Management

Use PM2 to keep the application running and restart on crashes.

> 💡 **Quick Start:** The included `run.sh` script handles PM2 automatically. Use `./run.sh start` to run in background.

### Install PM2

```bash
sudo npm install -g pm2
```

### Start Application with run.sh (Recommended)

```bash
# Navigate to app directory
cd /opt/label-automation

# Start in background with PM2
./run.sh start

# Check status
./run.sh status

# View logs
./run.sh logs

# Restart
./run.sh restart

# Stop
./run.sh stop
```

### Or Start Manually with PM2

```bash
# Navigate to app directory
cd /opt/label-automation

# Start with PM2
pm2 start npm --name "label-automation" -- start

# Or start the built file directly (faster)
pm2 start backend/dist/server.js --name "label-automation"
```

### Configure PM2

Create `ecosystem.config.cjs`:

```javascript
module.exports = {
  apps: [{
    name: 'label-automation',
    script: 'backend/dist/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/label-automation/err.log',
    out_file: '/var/log/label-automation/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

**Start with config:**
```bash
pm2 start ecosystem.config.cjs
```

### PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs label-automation

# Monitor resources
pm2 monit

# Restart
pm2 restart label-automation

# Stop
pm2 stop label-automation

# Delete from PM2
pm2 delete label-automation
```

### Auto-Start on Boot

```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save

# To disable
pm2 unstartup
```

---

## 🌍 Environment Variables

### Production .env Template

```bash
# Server
PORT=3000

# Shopify Configuration
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_TOKEN=shpat_xxxxxxxxxxxxx
SHOPIFY_WEBHOOK_SECRET=your-webhook-secret

# MakeCommerce
MC_ENV=live
MC_SHOP_ID=your-shop-uuid
MC_SHOP_SECRET=your-shop-secret

# DPD Lithuania
CARRIER_DPD_API_KEY=your-jwt-token

# OMNIVA
CARRIER_OMNIVA_USERNAME=your-username
CARRIER_OMNIVA_PASSWORD=your-password

# Sender Information
SENDER_NAME=Your Company
SENDER_PHONE=+370xxxxxxx
SENDER_EMAIL=shipping@yourcompany.com
SENDER_POSTAL=LT-01234

# Label Format
LABEL_FORMAT=A6_FULL_PAGE

# PrintNode
PRINTNODE_API_KEY=your-api-key
PRINTNODE_PRINTER_ID=12345678
```

### Security Best Practices

```bash
# Set proper permissions
chmod 600 .env
chown labelapp:labelapp .env

# Never commit .env
echo ".env" >> .gitignore

# Use environment-specific files
.env.production
.env.staging
.env.development
```

---

## 📊 Monitoring & Logging

### Application Logs

```bash
# Create log directory
sudo mkdir -p /var/log/label-automation
sudo chown labelapp:labelapp /var/log/label-automation

# View PM2 logs
pm2 logs label-automation --lines 100

# View error logs only
pm2 logs label-automation --err --lines 50

# Nginx logs
sudo tail -f /var/log/nginx/label-automation-access.log
sudo tail -f /var/log/nginx/label-automation-error.log
```

### Log Rotation

Create `/etc/logrotate.d/label-automation`:

```
/var/log/label-automation/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 labelapp labelapp
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Monitoring Tools

**PM2 Plus (Free tier available):**
```bash
pm2 link your-secret-key your-public-key
```

**Uptime Monitoring:**
- [UptimeRobot](https://uptimerobot.com/) (free)
- [Pingdom](https://www.pingdom.com/)
- [StatusCake](https://www.statuscake.com/)

**Health Check Endpoint:**

Add to `backend/src/server.ts`:
```typescript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});
```

---

## 💾 Backup Strategy

### Label Files

```bash
# Create backup script
nano /opt/label-automation/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/label-automation"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup label PDFs
tar -czf "$BACKUP_DIR/labels_$DATE.tar.gz" /opt/label-automation/labels/*.pdf

# Keep only last 30 days
find "$BACKUP_DIR" -type f -mtime +30 -delete

echo "Backup completed: labels_$DATE.tar.gz"
```

```bash
# Make executable
chmod +x /opt/label-automation/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
```

Add:
```
0 2 * * * /opt/label-automation/backup.sh >> /var/log/label-automation/backup.log 2>&1
```

### Database Backup (if added later)

```bash
# PostgreSQL example
pg_dump -U labelapp labeldb | gzip > /backups/labeldb_$(date +%Y%m%d).sql.gz
```

---

## 🔐 Security Hardening

### Firewall (UFW)

```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny direct access to Node.js port
sudo ufw deny 3000/tcp

# Check status
sudo ufw status verbose
```

### Fail2Ban (Prevent brute force)

```bash
# Install
sudo apt install -y fail2ban

# Configure
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

Add:
```ini
[nginx-http-auth]
enabled = true

[nginx-noscript]
enabled = true
```

```bash
# Restart
sudo systemctl restart fail2ban

# Check status
sudo fail2ban-client status
```

### Rate Limiting (Nginx)

Add to Nginx config:
```nginx
# Rate limiting zone
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# In location /api and /webhooks
location /api {
    limit_req zone=api_limit burst=20 nodelay;
    # ... rest of proxy config
}
```

### Application Security

1. **Environment Variables**: Never hardcode secrets
2. **HMAC Verification**: Already implemented for Shopify webhooks
3. **Input Validation**: Validate all webhook payloads
4. **HTTPS Only**: Enforce SSL for all connections
5. **CORS**: Restrict origins if needed

---

## ⚡ Performance Optimization

### Node.js Optimization

```javascript
// In ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'label-automation',
    script: 'backend/dist/server.js',
    instances: 'max',  // Use all CPU cores
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### Nginx Caching

```nginx
# Add to http block
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m use_temp_path=off;

# In location /api
location /api/orders {
    proxy_cache api_cache;
    proxy_cache_valid 200 1m;
    proxy_cache_use_stale error timeout updating;
    add_header X-Cache-Status $upstream_cache_status;
    # ... rest of config
}
```

### Database (if added)

- Use connection pooling
- Index frequently queried fields
- Implement caching (Redis)
- Regular VACUUM (PostgreSQL)

---

## 🐛 Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs label-automation --lines 100

# Common issues:
# 1. Port already in use
sudo lsof -i :3000
sudo kill -9 <PID>

# 2. Missing dependencies
npm install

# 3. Build errors
npm run build

# 4. Environment variables
cat .env
```

### WebSocket Connection Fails

```bash
# Check Nginx config
sudo nginx -t

# Verify WebSocket headers
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  https://labels.yourcompany.com/ws

# Check firewall
sudo ufw status

# Test locally
wscat -c ws://localhost:3000/ws
```

### High Memory Usage

```bash
# Check process
pm2 monit

# Restart if needed
pm2 restart label-automation

# Set memory limit
pm2 start ecosystem.config.cjs --max-memory-restart 500M
```

### Webhooks Not Received

1. **Check Shopify webhook logs** (Shopify Admin > Settings > Notifications > Webhooks)
2. **Verify HMAC secret** matches
3. **Check Nginx logs**:
   ```bash
   sudo tail -f /var/log/nginx/label-automation-access.log | grep webhook
   ```
4. **Test endpoint**:
   ```bash
   curl -X POST https://labels.yourcompany.com/webhooks/fulfillments-create \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

---

## 📞 Support

For production issues:
- **First step**: Run `./verify.sh` to check configuration
- Check logs: `./run.sh logs` or `pm2 logs`
- Review Nginx errors: `sudo tail -f /var/log/nginx/error.log`
- Monitor resources: `pm2 monit`, `htop`
- GitHub Issues: https://github.com/merkelis-p/label-automation/issues

---

**Production Checklist:**

- [ ] Server provisioned
- [ ] DNS configured
- [ ] SSL certificate installed
- [ ] Run `./verify.sh` - all checks pass
- [ ] Application built and deployed
- [ ] PM2 configured and running
- [ ] Nginx reverse proxy configured
- [ ] Firewall enabled
- [ ] Environment variables set
- [ ] Shopify webhooks updated with production URL
- [ ] PrintNode configured
- [ ] Monitoring enabled
- [ ] Backups scheduled
- [ ] Security hardening complete
- [ ] Performance optimized
- [ ] Documentation updated

**You're ready for production! 🚀**
