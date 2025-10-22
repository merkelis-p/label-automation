# 🚀 Quick Start Guide

Get up and running with the Label Automation System in minutes!

---

## ⚡ TL;DR - 5 Minute Setup

```bash
# 1. Clone & Install
git clone https://github.com/merkelis-p/label-automation.git
cd label-automation
chmod +x setup.sh

# 2. Run Setup Wizard
./setup.sh

# 3. Start Application (choose one)
./run.sh dev          # Development mode with hot reload
./run.sh start        # Production mode in background (PM2)

# 4. Open Browser
open http://localhost:3000   # Production (or http://localhost:5173 for dev)

# 5. Test with Mock Data
curl -X POST http://localhost:3000/api/test/seed
```

Done! 🎉

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- ✅ Node.js 18+ ([Download](https://nodejs.org/))
- ✅ Shopify store with Admin API access
- ✅ MakeCommerce account ([Sign up](https://maksekeskus.ee/))
- ✅ DPD and/or OMNIVA API credentials
- ✅ PrintNode account ([Sign up](https://www.printnode.com/))
- ✅ Thermal label printer (optional for testing)

---

## 🎯 Step-by-Step Setup

### 1. Get Your Credentials

**Shopify:**
1. Admin → Settings → Apps → "Develop apps"
2. Create app → Configure scopes: `read_orders`, `read_fulfillments`
3. Install app → Copy **Access Token**
4. Note your **Shop Domain**: `yourstore.myshopify.com`

**MakeCommerce:**
1. Login to dashboard
2. API Settings → Copy **Shop UUID**
3. Get DPD credentials from DPD Lithuania
4. Get OMNIVA credentials from OMNIVA

**PrintNode:**
1. Install client: [Download](https://www.printnode.com/download)
2. Login to [dashboard](https://app.printnode.com/)
3. Account → API Keys → Create new key
4. Printers → Note your **Printer ID**

### 2. Clone & Install

```bash
# Clone repository
git clone https://github.com/merkelis-p/label-automation.git
cd label-automation

# Make setup script executable
chmod +x setup.sh

# Run interactive setup
./setup.sh
```

The setup wizard will:
- ✅ Check prerequisites
- ✅ Install dependencies
- ✅ Create `.env` file with your credentials
- ✅ Build the project

### 3. Manual Setup (Alternative)

If you prefer manual setup:

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

Add your credentials to `.env`:

```bash
# Shopify
SHOPIFY_SHOP_DOMAIN=yourstore.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx
SHOPIFY_API_VERSION=2024-10
SHOPIFY_WEBHOOK_SECRET=your-secret

# MakeCommerce
MAKECOMMERCE_ENVIRONMENT=test  # or 'live'
MAKECOMMERCE_SHOP_ID=your-uuid

# DPD
MAKECOMMERCE_DPD_USERNAME=your-username
MAKECOMMERCE_DPD_API_KEY=your-jwt-token

# OMNIVA
MAKECOMMERCE_OMNIVA_USERNAME=your-username
MAKECOMMERCE_OMNIVA_PASSWORD=your-password

# Sender
SENDER_NAME=Your Company
SENDER_PHONE=+370xxxxxxx
SENDER_EMAIL=shipping@yourcompany.com
SENDER_COUNTRY=LT
SENDER_CITY=Vilnius
SENDER_POSTAL_CODE=01234
SENDER_STREET=Your Street 123

# PrintNode
PRINTNODE_API_KEY=your-api-key
PRINTNODE_PRINTER_ID=12345678

# Server
PORT=3000
NODE_ENV=development
```

### 4. Build & Run

**Using run.sh (Recommended):**

```bash
# Development Mode (with hot reload)
./run.sh dev
# Backend: http://localhost:3000
# Frontend: http://localhost:5173 (auto-proxied)

# Production Mode - Foreground
./run.sh build   # Build first
./run.sh prod    # Keeps terminal open

# Production Mode - Background (PM2)
./run.sh build   # Build first
./run.sh start   # Runs in background
./run.sh status  # Check if running
./run.sh logs    # View logs
./run.sh stop    # Stop when done
```

**Manual Commands:**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### 5. Test the Setup

Open browser to:
- **Development**: http://localhost:5173
- **Production**: http://localhost:3000

You should see the dashboard with:
- 🟢 "Live" connection status
- Empty orders table
- Empty print jobs table
- Printer status card

### 6. Seed Test Data

```bash
# Add 3 sample orders + 2 print jobs
curl -X POST http://localhost:3000/api/test/seed
```

Refresh dashboard - you should see data!

### 7. Generate Mock Order

Simulate the full order flow:

```bash
curl -X POST http://localhost:3000/api/test/mock-fulfillment
```

Watch the dashboard update in real-time:
1. **Order appears** (pending)
2. **Label created** (2 seconds later)
3. **Print started** (4 seconds later)
4. **Print completed** (7 seconds later)

### 8. Auto-Generate Orders

Test with continuous data:

```bash
# Generate order every 30 seconds
curl -X POST "http://localhost:3000/api/test/auto-generate/start?interval=30"

# Watch the dashboard fill with orders!

# Stop when done
curl -X POST http://localhost:3000/api/test/auto-generate/stop
```

### 9. Test Retry Mechanism (Optional)

Test the print job retry feature:

```bash
# 1. Set printer offline
curl -X POST http://localhost:3000/mock/printer-status \
  -H "Content-Type: application/json" \
  -d '{"status":"offline"}'

# 2. Create an order (will queue print job)
curl -X POST http://localhost:3000/api/test/mock-fulfillment

# 3. Check dashboard - print job should be "queued"

# 4. Bring printer back online (jobs auto-retry)
curl -X POST http://localhost:3000/mock/printer-status \
  -H "Content-Type: application/json" \
  -d '{"status":"online"}'

# 5. Watch queued jobs automatically process!
```

---

## 🎮 Dashboard Overview

### Orders Table
- **Click any row** → See full order details dialog
- **Eye icon** → View label in browser
- **Download icon** → Save PDF
- **Print icon** → Send to printer immediately
- **Pagination** → Navigate through orders
- **Order Details Dialog**:
  - Full order information
  - Associated print jobs with status
  - **Retry button** for queued/failed jobs

### Print Jobs Table
- Track all print jobs in real-time
- View status:
  - **Queued** → Waiting for printer to come online
  - **Printing** → Currently being printed
  - **Completed** → Successfully printed
  - **Failed** → Error occurred
- See timestamps (created, completed)
- **Automatic retry** when printer comes back online
- **Manual retry** available in order details

### Printer Status
- **🟢 Online** → Printer ready, jobs will print automatically
- **🔴 Offline** → Jobs will queue until online
- **⚠️ Error** → Check printer connection
- **Toggle Status** (testing): Use `/mock/printer-status` endpoint

### Connection Status
- **🟢 Live** → WebSocket connected
- **🔴 Disconnected** → Reconnecting...

---

## 🔗 API Quick Reference

### Dashboard API
```bash
# Get all orders
curl http://localhost:3000/api/orders

# Get print jobs
curl http://localhost:3000/api/print-jobs

# Get printer status
curl http://localhost:3000/api/printer-status

# Retry a print job
curl -X POST http://localhost:3000/api/print-jobs/JOB_ID/retry
```

### Test Endpoints
```bash
# Seed data
curl -X POST http://localhost:3000/api/test/seed

# Mock fulfillment
curl -X POST http://localhost:3000/api/test/mock-fulfillment

# Start auto-generate (custom interval)
curl -X POST "http://localhost:3000/api/test/auto-generate/start?interval=10"

# Stop auto-generate
curl -X POST http://localhost:3000/api/test/auto-generate/stop

# Toggle printer status (testing)
curl -X POST http://localhost:3000/mock/printer-status \
  -H "Content-Type: application/json" \
  -d '{"status":"offline"}'  # or "online", "error"

# Manual print trigger
curl -X POST http://localhost:3000/mock/printnode/jobs \
  -H "Content-Type: application/json" \
  -d '{"printerId":"test","title":"Test Label","contentType":"pdf_uri","content":"URL"}'
```

### Shopify Webhooks
```bash
# Fulfillment webhook (with HMAC verification)
POST https://your-domain.com/webhooks/fulfillments-create

# Order paid webhook
POST https://your-domain.com/webhooks/orders-paid
```

---

## 🐛 Common Issues & Solutions

### Port 3000 Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

### Frontend Won't Connect to Backend
```bash
# Check backend is running
curl http://localhost:3000/api/orders

# Check Vite proxy (frontend/vite.config.ts)
# Should proxy /api and /ws to localhost:3000
```

### WebSocket Connection Failed
- Ensure backend is running
- Check browser console for errors
- Verify no firewall blocking WebSocket

### Labels Not Printing
1. Check PrintNode client is running (green icon)
2. Verify printer is online in PrintNode dashboard
3. Test printer with PrintNode web interface
4. Check API key and Printer ID in `.env`

### "Module not found" Errors
```bash
# Reinstall dependencies
rm -rf node_modules frontend/node_modules
npm install
cd frontend && npm install
```

### Build Errors
```bash
# Check TypeScript version
npx tsc --version

# Clean build
rm -rf backend/dist frontend/dist
npm run build
```

---

## 📚 Next Steps

### Production Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- VPS setup
- Docker deployment
- Cloud platforms
- Nginx configuration
- SSL setup
- PM2 process management

### PrintNode Setup
See [PRINTNODE_SETUP.md](PRINTNODE_SETUP.md) for:
- Client installation
- Printer configuration
- API key generation
- Testing connection
- Troubleshooting

### Shopify Webhooks
Configure Shopify webhooks:
1. Your app → Configuration → Webhooks
2. Add webhook:
   - Topic: `fulfillments/create`
   - URL: `https://your-domain.com/webhooks/fulfillments-create`
   - Format: JSON
3. Copy webhook secret to `.env`

---

## 💡 Pro Tips

### Development
```bash
# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend

# Build only frontend
npm run build:frontend

# Build only backend
npm run build:backend

# Type check without building
npx tsc --noEmit
```

### Testing
```bash
# Seed test data
curl -X POST http://localhost:3000/api/test/seed

# Generate mock fulfillment
curl -X POST http://localhost:3000/api/test/mock-fulfillment

# Auto-generate orders
curl -X POST "http://localhost:3000/api/test/auto-generate/start?interval=30"

# Test printer status toggle
curl -X POST http://localhost:3000/mock/printer-status \
  -H "Content-Type: application/json" \
  -d '{"status":"offline"}'
```

### Debugging
```bash
# View backend logs (using run.sh - recommended)
./run.sh logs

# Or view PM2 logs directly
pm2 logs label-automation

# Check PM2 status
./run.sh status

# Or use PM2 directly
pm2 status

# Check WebSocket connection
wscat -c ws://localhost:3000/ws

# Monitor network traffic
# Open browser DevTools → Network tab → WS filter
```

### Keyboard Shortcuts (Dashboard)
- `Cmd/Ctrl + R` → Refresh page
- `Esc` → Close dialog
- Click row → Open details
- `Tab` → Navigate elements

---

## 🎯 Success Checklist

Before going to production:

- [ ] All dependencies installed
- [ ] `.env` configured with production credentials
- [ ] Application builds without errors
- [ ] Dashboard loads and shows "Live" status
- [ ] Mock data displays correctly
- [ ] PrintNode client connected
- [ ] Test print successful
- [ ] Shopify webhooks configured with production URL
- [ ] SSL certificate installed
- [ ] Reverse proxy (Nginx) configured
- [ ] PM2 process manager setup
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Monitoring enabled

---

## 📞 Getting Help

**Documentation:**
- [README.md](README.md) - Full documentation
- [PRINTNODE_SETUP.md](PRINTNODE_SETUP.md) - PrintNode guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment


**Support:**
- GitHub Issues: [Report bugs](../../issues)
- GitHub Discussions: [Ask questions](../../discussions)
- Email: patrikas.merkelis@gmail.com

---

## 🎉 You're All Set!

Your Label Automation System is ready to:
- ✅ Receive Shopify fulfillment webhooks
- ✅ Generate shipping labels via MakeCommerce
- ✅ Print labels automatically via PrintNode
- ✅ Track orders in real-time dashboard
- ✅ Monitor print jobs and printer status

**Happy shipping! 📦🚀**
