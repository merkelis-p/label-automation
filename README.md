# 🏷️ Label Automation System

A real-time order fulfillment and label printing automation system for Shopify stores using MakeCommerce shipping API (OMNIVA & DPD Lithuania carriers) with PrintNode integration.

![Dashboard Preview](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

## ✨ Features

### 🎯 Core Functionality
- **Real-time Order Processing**: Automatic webhook handling from Shopify fulfillments
- **Multi-Carrier Support**: 
  - DPD Lithuania (parcel lockers & courier)
  - OMNIVA (parcel terminals)
- **Automatic Label Generation**: Creates shipping labels via MakeCommerce API
- **Auto-Print**: Sends labels directly to PrintNode-connected printers
- **Live Dashboard**: WebSocket-powered real-time order tracking

### 📊 Dashboard Features
- **Order Management**:
  - View all fulfilled orders with status tracking
  - Click any order for detailed information dialog
  - Download labels as PDF
  - Manual print trigger
  - Pagination for large order volumes
  
- **Print Job Monitoring**:
  - Track print queue and status (queued, printing, completed, failed)
  - View associated print jobs per order
  - Print history with timestamps
  - **Retry failed/queued jobs** - Manual retry button for offline printers
  - **Automatic retry** - Jobs auto-process when printer comes online
  
- **Printer Status**:
  - Real-time printer connectivity monitoring
  - Online/offline status indicators
  - Toggle printer status for testing

### 🔔 Smart Notifications
- Toast notifications for all events:
  - New orders received
  - Labels created
  - Print job status changes
  - Printer connectivity changes
  - Connection status updates

### 🧪 Development Tools
- **Mock API**: Test without real orders
  - Seed test data
  - Generate mock fulfillments
  - Auto-generate orders at intervals
- **Hot Reload**: Frontend and backend auto-restart on changes
- **TypeScript**: Full type safety across the stack

---

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/

2. **Shopify Store** with:
   - Admin API access
   - Webhook permissions
   - Order fulfillment capabilities

3. **MakeCommerce Account**
   - Sign up: https://maksekeskus.ee/
   - API credentials for carriers (DPD_LT and/or OMNIVA)

4. **PrintNode Account** (for automatic printing)
   - Sign up: https://www.printnode.com/
   - Computer with PrintNode client installed
   - Thermal label printer connected

---

## 📦 Installation

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/merkelis-p/label-automation.git
cd label-automation

# Run the setup script
chmod +x setup.sh
./setup.sh
```

The setup script will:
- Check prerequisites
- Install dependencies
- Guide you through configuration
- Create `.env` file
- Build the project
- Verify the setup

### Option 2: Manual Setup

1. **Clone and Install**
```bash
git clone https://github.com/merkelis-p/label-automation.git
cd label-automation
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
```

Edit `.env` with your credentials (see Configuration section below)

3. **Build**
```bash
npm run build
```

4. **Start**
```bash
npm start
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Shopify Configuration
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_VERSION=2024-10
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_key

# MakeCommerce API
MAKECOMMERCE_ENVIRONMENT=live  # or 'test' for sandbox
MAKECOMMERCE_SHOP_ID=your_shop_uuid

# DPD Lithuania Credentials
MAKECOMMERCE_DPD_USERNAME=your_dpd_api_username
MAKECOMMERCE_DPD_API_KEY=your_dpd_jwt_token

# OMNIVA Credentials  
MAKECOMMERCE_OMNIVA_USERNAME=your_omniva_username
MAKECOMMERCE_OMNIVA_PASSWORD=your_omniva_password

# Sender Information
SENDER_NAME=Your Company Name
SENDER_PHONE=+370xxxxxxxx
SENDER_EMAIL=shipping@yourcompany.com
SENDER_COUNTRY=LT
SENDER_CITY=Vilnius
SENDER_POSTAL_CODE=01234
SENDER_STREET=Your Street 123

# PrintNode Configuration
PRINTNODE_API_KEY=your_printnode_api_key
PRINTNODE_PRINTER_ID=your_printer_id  # Get from PrintNode dashboard

# Server Configuration
PORT=3000
NODE_ENV=production
```

---

## 🔧 Detailed Setup Guide

### 1. Shopify Setup

#### Get API Credentials

1. **Go to Shopify Admin** → Settings → Apps and sales channels
2. **Click "Develop apps"** → "Create an app"
3. **Name your app**: "Label Automation"
4. **Configure Admin API scopes**:
   - `read_orders`
   - `read_fulfillments`
   - `read_shipping`
5. **Install the app** and copy the **Access Token**
6. Your shop domain is: `your-store.myshopify.com`

#### Setup Webhooks

1. **In your app** → Configuration → Webhooks
2. **Add webhooks**:
   
   **Fulfillment Creation:**
   - Topic: `fulfillments/create`
   - URL: `https://your-domain.com/webhooks/fulfillments-create`
   - Format: JSON
   
   **Order Paid** (optional):
   - Topic: `orders/paid`
   - URL: `https://your-domain.com/webhooks/orders-paid`
   - Format: JSON

3. **Copy the Webhook Secret** for HMAC verification

### 2. MakeCommerce Setup

#### Account Setup

1. **Sign up** at https://maksekeskus.ee/
2. **Navigate to** API Settings
3. **Copy your Shop UUID** (MAKECOMMERCE_SHOP_ID)

#### DPD Lithuania Configuration

1. **Contact DPD Lithuania** to get API credentials
2. **Get your credentials**:
   - API Username
   - JWT Token (API Key)
3. **Test endpoint**: `https://esiunta.dpd.lt/api/v1/`
4. **Important**: Use carrier code `DPD_LT` (not just `DPD`)

#### OMNIVA Configuration

1. **Sign up** for OMNIVA API access
2. **Get your credentials**:
   - API Username
   - API Password
3. **Test endpoint**: Available via MakeCommerce
4. **Get locker list**: https://www.omniva.ee/era/parcel_machines

### 3. PrintNode Setup

#### Install PrintNode Client

1. **Download PrintNode**:
   - Windows: https://www.printnode.com/download/windows
   - macOS: https://www.printnode.com/download/mac
   - Linux: https://www.printnode.com/download/linux

2. **Install and run** the PrintNode client on your computer

3. **Connect your printer**:
   - Plug in your thermal label printer (Zebra, Brother, Dymo, etc.)
   - Ensure it's powered on and recognized by your OS

#### Get API Credentials

1. **Sign in** to https://app.printnode.com/
2. **Go to** Account → API Keys
3. **Create new API key**:
   - Description: "Label Automation System"
   - Copy the generated key

#### Find Your Printer ID

1. **In PrintNode dashboard** → Printers
2. **Find your printer** in the list
3. **Click on it** and copy the **Printer ID** (numeric value)

Or use the API:
```bash
curl -u YOUR_API_KEY: https://api.printnode.com/printers
```

#### Test Your Printer

```bash
curl -X POST https://api.printnode.com/printjobs \
  -u YOUR_API_KEY: \
  -H "Content-Type: application/json" \
  -d '{
    "printerId": YOUR_PRINTER_ID,
    "title": "Test Print",
    "contentType": "pdf_uri",
    "content": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  }'
```

---

## 🎮 Usage

### Starting the Application

#### Quick Start with run.sh (Recommended)

The easiest way to run the application is using the provided `run.sh` script:

```bash
# Development mode (with hot reload)
./run.sh dev

# Build for production
./run.sh build

# Production mode - foreground (keeps terminal open)
./run.sh prod

# Production mode - background with PM2 (recommended for servers)
./run.sh start

# Check PM2 status
./run.sh status

# View logs
./run.sh logs

# Restart application
./run.sh restart

# Stop PM2 process
./run.sh stop
```

**Features:**
- ✅ Auto-checks for `.env` file
- ✅ PM2 process management (background daemon)
- ✅ Auto-restart on crashes
- ✅ Log management (stored in `logs/` directory)
- ✅ Colored output for better visibility
- ✅ Easy mode switching (dev/prod/background)

**PM2 Benefits:**
- 🔄 Process keeps running after closing terminal
- 🚀 Auto-restart on crashes (configurable delay)
- 📊 Memory monitoring (restarts if exceeds 1GB)
- 📝 Separate log files for stdout and stderr
- ⚡ Zero-downtime restarts
- 🖥️ Can enable auto-start on system boot

**Typical Production Workflow:**
```bash
# 1. Initial deployment
./run.sh build
./run.sh start

# 2. After code updates
git pull
./run.sh build
./run.sh restart

# 3. Check everything is working
./run.sh status
./run.sh logs  # Ctrl+C to exit

# 4. Enable auto-start on server reboot (optional)
pm2 startup
pm2 save
```

#### Manual Commands

##### Development Mode (with hot reload)
```bash
npm run dev
```
- Backend: http://localhost:3000
- Frontend: http://localhost:5173 (auto-proxied)
- WebSocket: ws://localhost:3000/ws

##### Production Mode
```bash
npm run build
npm start
```
- Application: http://localhost:3000
- Serves built frontend from `/frontend/dist`

### Accessing the Dashboard

Open your browser to: **http://localhost:3000**

You'll see:
- 📊 **Orders table** with real-time updates
- 🖨️ **Print jobs** tracking
- 🔌 **Printer status** indicator
- 🟢 **Live connection** status

### Testing Without Real Orders

#### Seed Test Data
```bash
curl -X POST http://localhost:3000/api/test/seed
```
Adds 3 sample orders and 2 print jobs to the dashboard.

#### Generate One Mock Order
```bash
curl -X POST http://localhost:3000/api/test/mock-fulfillment
```
Creates a random fulfillment that simulates the entire flow:
1. Order received (2s)
2. Label created (2s)
3. Print started (3s)
4. Print completed

#### Auto-Generate Orders (30 second intervals)
```bash
# Start auto-generation
curl -X POST "http://localhost:3000/api/test/auto-generate/start?interval=30"

# Stop auto-generation
curl -X POST http://localhost:3000/api/test/auto-generate/stop
```

---

## 📁 Project Structure

```
label-automation/
├── backend/
│   ├── src/
│   │   ├── config/           # Environment configuration
│   │   ├── controllers/      # Request handlers
│   │   │   ├── webhooks.controller.ts    # Shopify webhooks (not used in current setup)
│   │   │   ├── api.controller.ts         # Dashboard API endpoints
│   │   │   └── mock.controller.ts        # Test/mock endpoints
│   │   ├── middleware/       # HMAC verification, etc.
│   │   ├── routes/           # Express routes
│   │   ├── services/         # Business logic
│   │   │   ├── shopify.service.ts        # Shopify API client
│   │   │   ├── makecommerce.service.ts   # Label generation
│   │   │   └── printnode.service.ts      # Printing service
│   │   ├── types/            # TypeScript interfaces
│   │   ├── store.ts          # In-memory data store
│   │   ├── websocket.ts      # WebSocket server
│   │   └── server.ts         # Express app entry
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── OrdersTable.tsx
│   │   │   ├── PrintJobsTable.tsx
│   │   │   ├── PrinterStatus.tsx
│   │   │   └── ConnectionStatus.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   └── useWebSocket.ts
│   │   ├── types/            # TypeScript interfaces
│   │   ├── lib/              # Utilities
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── .env.example              # Environment template
├── .gitignore
├── package.json              # Root package.json
├── setup.sh                  # Automated setup script
├── run.sh                    # Start script
└── README.md                 # This file
```

---

## 🔄 Workflow

### Automatic Processing Flow

1. **Customer places order** in Shopify with OMNIVA/DPD shipping
2. **Order fulfilled** in Shopify admin
3. **Webhook fires** → Backend receives fulfillment notification
4. **Carrier detection**: System identifies DPD_LT or OMNIVA from tracking
5. **Locker extraction**: Parses locker ID from order attributes
6. **Label creation**: Calls MakeCommerce API to generate shipping label
7. **Auto-print**: Sends PDF to PrintNode for printing
8. **Dashboard update**: Real-time WebSocket broadcast to all connected clients
9. **Status tracking**: Order moves through: pending → label_created → printed

### Manual Operations

- **Click order row**: View detailed information
- **Download label**: Save PDF locally
- **Print label**: Send to printer on demand
- **View print jobs**: See all associated printing activity

---

## 🛠️ Development

### Available Scripts

```bash
# Install dependencies
npm install

# Development (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Build frontend only
npm run build:frontend

# Build backend only
npm run build:backend

# Type checking
npm run type-check
```

### Tech Stack

**Backend:**
- Node.js + TypeScript
- Express.js
- WebSocket (ws)
- Axios for HTTP requests

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Sonner (toast notifications)
- Lucide icons

---

## 🐛 Troubleshooting

### Common Issues

#### Port 3000 already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env
PORT=3001
```

#### WebSocket connection fails
- Check firewall settings
- Ensure backend is running
- Verify no proxy blocking WebSocket upgrade

#### Labels not printing
1. **Check PrintNode client is running**
2. **Verify printer is online** in PrintNode dashboard
3. **Test printer** with PrintNode web interface
4. **Check API key** is correct in `.env`
5. **Verify printer ID** matches your printer

#### MakeCommerce API errors
- **"Invalid api token"**: Check DPD API key format (JWT)
- **"Valid credentials must be present"**: Verify username/password
- **Carrier mismatch**: Use `DPD_LT` not `DPD` for Lithuania
- **Test vs Production**: Ensure correct MAKECOMMERCE_ENVIRONMENT

#### Shopify webhooks not received
1. **Verify webhook URL** is publicly accessible
2. **Check HMAC secret** matches Shopify configuration
3. **Test with ngrok** for local development:
   ```bash
   ngrok http 3000
   # Use ngrok URL in Shopify webhook settings
   ```

---

## 🔒 Security

### Production Checklist

- [ ] Use HTTPS for webhook endpoints
- [ ] Enable HMAC verification for Shopify webhooks
- [ ] Store sensitive credentials in environment variables
- [ ] Never commit `.env` file
- [ ] Implement rate limiting
- [ ] Add authentication for dashboard access
- [ ] Regular security audits
- [ ] Keep dependencies updated

### HMAC Verification

The system verifies Shopify webhook authenticity using HMAC-SHA256:

```typescript
X-Shopify-Hmac-Sha256 header compared against computed digest
```

---

## 📝 API Endpoints

### Dashboard API

```
GET  /api/orders                      # Get all orders
GET  /api/print-jobs                  # Get all print jobs  
GET  /api/printer-status              # Get printer status
POST /api/print-jobs/:jobId/retry     # Retry a queued/failed print job
```

### Webhooks

```
POST /webhooks/fulfillments-create  # Shopify fulfillment webhook
POST /webhooks/orders-paid          # Shopify order paid webhook
```

### Test/Mock Endpoints

```
POST /api/test/seed                      # Seed test data
POST /api/test/mock-fulfillment          # Generate one mock order
POST /api/test/auto-generate/start       # Start auto-generation
POST /api/test/auto-generate/stop        # Stop auto-generation
POST /mock/printer-status                # Toggle printer (online/offline/error)
POST /mock/printnode/jobs                # Create print job (manual print)
```

### WebSocket

```
ws://localhost:3000/ws

Message types:
- order_update     # Order status changed
- print_update     # Print job status changed
- printer_status   # Printer connectivity changed
```

---

## 🚢 Deployment

### Using run.sh with PM2 (Recommended)

The easiest way to deploy is using the included `run.sh` script:

```bash
# Build for production
./run.sh build

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

The script automatically:
- ✅ Manages PM2 process (background daemon)
- ✅ Auto-restarts on crashes
- ✅ Monitors memory usage (1GB limit)
- ✅ Manages log files (`logs/err.log`, `logs/out.log`)

### Manual PM2 Setup

If you prefer manual setup:

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2 using the config file
pm2 start ecosystem.config.cjs

# Or start directly
pm2 start backend/dist/server.js --name "label-automation"

# Monitor
pm2 monit

# Auto-restart on boot
pm2 startup
pm2 save
```

> **Note:** The project includes `ecosystem.config.cjs` with optimized PM2 settings.

### Using Docker

```dockerfile
# Create Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t label-automation .
docker run -p 3000:3000 --env-file .env label-automation
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## 📊 Monitoring

### Logs

```bash
# Using run.sh (recommended)
./run.sh logs

# Or view PM2 logs directly
pm2 logs label-automation

# View only errors
pm2 logs label-automation --err

# Or with standard Node (foreground mode)
npm start > app.log 2>&1
```

### Health Check

```bash
curl http://localhost:3000/api/orders
```

### PM2 Process Monitoring

```bash
# Check if running
./run.sh status

# Or use PM2 directly
pm2 status

# Interactive monitoring dashboard
pm2 monit
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 💬 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Contact: patrikas.merkelis@gmail.com

---

## 🙏 Acknowledgments

- [Shopify Admin API](https://shopify.dev/api/admin)
- [MakeCommerce API](https://maksekeskus.ee/)
- [PrintNode API](https://www.printnode.com/en/docs/api)
- [shadcn/ui](https://ui.shadcn.com/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)

---
