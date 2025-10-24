# 🏷️ Label Automation System

A real-time order fulfillment and label printing automation system for Shopify stores using MakeCommerce shipping API (OMNIVA & DPD Lithuania carriers) with PrintNode integration.

![Dashboard Preview](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

> **📍 Installing on macOS 10.13.6 (High Sierra) or older?**  
> See [INSTALL_OLD_MAC.md](./INSTALL_OLD_MAC.md) for special instructions or run `./fix-old-mac.sh`

## ✨ Features

### 🎯 Core Functionality
- **Real-time Order Processing**: Automatic webhook handling from Shopify fulfillments
- **Multi-Carrier Support**: 
  - DPD Lithuania (parcel lockers & courier)
  - OMNIVA (parcel terminals)
- **Automatic Label Generation**: Creates shipping labels via MakeCommerce API
- **Auto-Print**: Sends labels directly to PrintNode-connected printers
- **Live Dashboard**: WebSocket-powered real-time order tracking
- **Order Details Dialog**: View complete order information including:
  - Product line items with images (when available)
  - Customer information
  - Parcel locker details (for terminal deliveries)
  - Order totals and pricing
  - Shipping information

### 📊 Dashboard Features
- **Order Management**:
  - View all fulfilled orders with status tracking
  - **Click any order** to open detailed information dialog
  - See product images, quantities, and prices
  - View customer and shipping/parcel locker details
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
  - Data cleared/refreshed

### 🧪 Development Tools
- **Mock API**: Test without real orders
  - Seed test data with real Shopify order IDs
  - Generate mock fulfillments
  - Auto-generate orders at intervals
  - List recent Shopify orders
- **Hot Reload**: Frontend and backend auto-restart on changes
- **TypeScript**: Full type safety across the stack

---

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v17.9.1 or higher)
   - Download: https://nodejs.org/
   
   **Important - Node.js Version Compatibility:**
   - **Node 17.9.1+**: ✅ Can run the application using pre-built files (skip build step)
   - **Node 18+**: ✅ Can build the application + run it
   - **Node 16 or below**: ❌ Not supported
   
   **Why two versions?**
   - The frontend uses **Vite 7** and **React 19**, which require Node.js 18+ to build
   - However, the **built application** can run on Node.js 17.9.1+
   - Pre-built files (`frontend/dist/` and `backend/dist/`) are included in the repository
   - This means **Node 17.9.1 users can skip the build step** and use the pre-built files
   
   **What you can do with each version:**
   
   | Node Version | Can Run App | Can Build | Can Use Scripts |
   |--------------|-------------|-----------|-----------------|
   | 17.9.1 - 17.x | ✅ Yes (use pre-built) | ❌ No (frontend) | ✅ run.sh start/prod/status/logs |
   | 18.0+ | ✅ Yes | ✅ Yes | ✅ All scripts (dev/build/start) |
   
   **For Node 17.9.1 users:**
   ```bash
   # Skip build, use pre-built files
   npm install
   cd frontend && npm install && cd ..
   
   # Start the app (any of these work)
   npm start
   # OR
   ./run.sh start   # PM2 background mode
   # OR
   ./run.sh prod    # Foreground mode
   
   # Management commands also work
   ./run.sh status
   ./run.sh logs
   ./run.sh restart
   ./run.sh stop
   ```
   
   **What Node 17.9.1 users CANNOT do:**
   ```bash
   # These will fail - require Node 18+
   npm run build      # ❌ Frontend build fails
   ./run.sh build     # ❌ Frontend build fails
   ./run.sh dev       # ❌ Requires rebuild on changes
   ./setup.sh         # ❌ Includes build step
   ```
   
   **For Node 18+ users:**
   ```bash
   # Full build capability
   ./setup.sh  # Interactive setup with build
   ./run.sh dev  # Development mode
   ./run.sh build && ./run.sh start  # Production
   # All commands work
   ```

2. **Shopify Store** with:
   - Admin API access (see [Shopify API Scopes](#shopify-api-scopes) below)
   - Webhook permissions
   - Order fulfillment capabilities
   - **Required API Scopes**:
     - `read_orders` - To fetch order details
     - `read_fulfillments` - To process fulfillment webhooks
     - `read_shipping` - To access shipping information
     - `read_products` - ⚠️ **Optional but recommended** - To display product images in order details

3. **MakeCommerce Account**
   - Sign up: https://maksekeskus.ee/
   - API credentials for carriers (DPD_LT and/or OMNIVA)

4. **PrintNode Account** (for automatic printing)
   - Sign up: https://www.printnode.com/
   - Computer with PrintNode client installed
   - Thermal label printer connected

---

## 🔑 Shopify API Scopes

### Required Scopes

Your Shopify Admin API access token **must** have the following scopes:

| Scope | Purpose | Required |
|-------|---------|----------|
| `read_orders` | Fetch order details and line items | ✅ Yes |
| `read_fulfillments` | Process fulfillment webhooks | ✅ Yes |
| `read_shipping` | Access shipping lines and tracking info | ✅ Yes |
| `read_products` | Fetch product images for order details dialog | ⚠️ **Recommended** |

### About Product Images

**⚠️ Important**: Product images in the order details dialog require the `read_products` scope.

- **With `read_products` scope**: Product images are automatically fetched and displayed
- **Without `read_products` scope**: Order details work fine, but product images won't be shown

If you see orders without product images in the dialog, check if your Shopify API token has the `read_products` scope enabled.

### How to Check/Add Scopes

1. Go to your Shopify Admin: `https://your-store.myshopify.com/admin`
2. Navigate to: **Settings → Apps and sales channels → Develop apps**
3. Click on your app
4. Go to **Configuration** tab
5. Under **Admin API access scopes**, ensure the required scopes are checked
6. Save and **reinstall the app** if you add new scopes

### Creating a Shopify Custom App (First Time Setup)

If you don't have a custom app yet, follow these steps to create one:

#### Step 1: Enable Custom App Development

1. **Go to Shopify Admin**: `https://your-store.myshopify.com/admin`
2. **Navigate to**: Settings (bottom left) → Apps and sales channels
3. **Click**: "Develop apps" (or "Develop apps for your store")
4. **If prompted**: Click "Allow custom app development"
5. **Read and confirm** the warning dialog

#### Step 2: Create Your Custom App

1. **Click**: "Create an app" button
2. **App name**: Enter "Label Automation" (or your preferred name)
3. **App developer**: Select yourself or your company
4. **Click**: "Create app"

#### Step 3: Configure API Scopes

1. **In your new app**, click the "Configuration" tab
2. **Under "Admin API access scopes"**, click "Configure"
3. **Search and enable** the following scopes:

   **Required Scopes:**
   - ✅ `read_orders` - Read orders
   - ✅ `read_fulfillments` - Read fulfillments
   - ✅ `read_shipping` - Read shipping information
   
   **Recommended Scope:**
   - ⚠️ `read_products` - Read products (for product images in order details)

4. **Click**: "Save" at the bottom

#### Step 4: Install the App

1. **Go to**: "API credentials" tab
2. **Click**: "Install app" button
3. **Review the permissions** and click "Install"
4. **Important**: A success message will appear

#### Step 5: Get Your Access Token

1. **In the "API credentials" tab**, you'll now see "Admin API access token"
2. **Click**: "Reveal token once" button
3. **Copy the token immediately** - it will only be shown once!
4. **Save it securely** - you'll need this for your `.env` file

   ```bash
   # It looks like this:
   shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. **If you lose it**: You'll need to uninstall and reinstall the app to get a new token

#### Step 6: Get Your Shop Domain

Your shop domain is the `.myshopify.com` URL:

1. **Format**: `your-store.myshopify.com`
2. **Find it**: 
   - In your browser's address bar (admin URL)
   - Or in Settings → General → Store details
3. **Examples**:
   - ✅ Correct: `doshabliss.myshopify.com`
   - ❌ Wrong: `doshabliss.lt` (custom domain)
   - ❌ Wrong: `https://doshabliss.myshopify.com` (includes https)

#### Step 7: Configure Webhooks (Optional - for production)

Webhooks are needed for automatic order processing in production:

1. **In your app**, go to "Configuration" tab
2. **Scroll down** to "Webhooks" section
3. **Click**: "Add webhook"
4. **Configure webhook**:
   - **Event**: `fulfillments/create`
   - **Format**: JSON
   - **URL**: `https://your-domain.com/webhooks/fulfillments-create`
   - **API version**: 2024-10 (or latest)
5. **Click**: "Save"
6. **Copy the "Signing secret"** - you'll need this for `.env` as `SHOPIFY_WEBHOOK_SECRET`

**Note**: For local development/testing, you can skip webhooks and use the test endpoints instead.

#### Summary - What You Need

After completing the setup, you'll have:

| Item | Where to Find | Used For |
|------|---------------|----------|
| **Access Token** | API credentials → Reveal token | `SHOPIFY_ACCESS_TOKEN` in `.env` |
| **Shop Domain** | Browser URL or Settings → General | `SHOPIFY_SHOP_DOMAIN` in `.env` |
| **Webhook Secret** | Configuration → Webhooks → Signing secret | `SHOPIFY_WEBHOOK_SECRET` in `.env` |
| **API Version** | Use `2024-10` | `SHOPIFY_API_VERSION` in `.env` |

**Example `.env` configuration:**
```bash
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_VERSION=2024-10
SHOPIFY_WEBHOOK_SECRET=your_webhook_signing_secret
```

---

## 📦 Installation

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/merkelis-p/label-automation.git
cd label-automation

# Make scripts executable
chmod +x setup.sh run.sh verify.sh

# Run the interactive setup wizard
./setup.sh
```

The setup script will:
- Check prerequisites (Node.js version, npm)
- Install backend and frontend dependencies
- Guide you through configuration
- Create `.env` file interactively
- Optionally build the project
- Verify the setup

**After setup, verify everything is ready:**
```bash
./verify.sh
```

This checks:
- All required files and directories exist
- Dependencies are installed
- Build files are present
- Environment variables are configured
- Git configuration is correct

### Option 2: Manual Setup

1. **Clone and Install**
```bash
git clone https://github.com/merkelis-p/label-automation.git
cd label-automation

# Make scripts executable (for later use)
chmod +x setup.sh run.sh verify.sh

npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
```

Edit `.env` with your credentials (see Configuration section below)

3. **Build (Optional - pre-built files included)**
```bash
npm run build  # Skip this - pre-built backend and frontend included
```

4. **Verify Setup**
```bash
./verify.sh  # Check if everything is configured correctly
```

5. **Start**
```bash
./run.sh start  # Start with PM2 (background)
# or
./run.sh prod   # Start in foreground
# or
npm start       # Manual start
```

#### Node.js Version Compatibility

**All Node 17.9.1+ Users:**
- ✅ Pre-built backend (`backend/dist/`) and frontend (`frontend/dist/`) files are **included in the repository**
- ✅ Can run the app without building: `npm start` or `./run.sh start`
- ✅ Can use production scripts: `./run.sh prod`, `./run.sh start`, `./run.sh status`, `./run.sh logs`
- ✅ Full runtime support for all features
- ❌ Cannot build frontend (requires Node 18+)
- ❌ Cannot use: `./run.sh build`, `./run.sh dev`, `./setup.sh`

**Node 18+ Users:**
- ✅ Can rebuild if making code changes: `npm run build`
- ✅ Development mode with hot reload: `npm run dev` or `./run.sh dev`
- ✅ All scripts work: `./setup.sh`, `./run.sh build`, `./run.sh dev`, etc.
- ✅ All features available

**Summary:**
- **Node 17.9.1**: Perfect for running in production using pre-built files
- **Node 18+**: Required for development and building from source

**Why include builds?** 
- **Backend**: TypeScript compilation (works on Node 17, but faster to skip)
- **Frontend**: Build tools (Vite 7, React 19) require Node 18+, so pre-built files allow Node 17 users to run the app

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

**First time?** See the complete guide above in [Creating a Shopify Custom App](#creating-a-shopify-custom-app-first-time-setup) for detailed step-by-step instructions.

**Quick summary:**

1. **Go to Shopify Admin** → Settings → Apps and sales channels
2. **Click "Develop apps"** → "Create an app"
3. **Name your app**: "Label Automation"
4. **Configure Admin API scopes**:
   - `read_orders` ✅ Required
   - `read_fulfillments` ✅ Required
   - `read_shipping` ✅ Required
   - `read_products` ⚠️ Recommended (for product images)
5. **Install the app** and copy the **Access Token** (starts with `shpat_`)
6. Your shop domain is: `your-store.myshopify.com` (not your custom domain!)

**Important Notes:**
- ⚠️ Access token is shown **only once** - save it immediately
- ✅ Use `.myshopify.com` domain, not your custom domain
- ✅ API Version: Use `2024-10` in `.env`

#### Setup Webhooks (Production Only)

Webhooks are optional for development - you can test using the test endpoints. For production:

1. **In your app** → Configuration → Webhooks
2. **Add webhooks**:
   
   **Fulfillment Creation:**
   - Topic: `fulfillments/create`
   - URL: `https://your-domain.com/webhooks/fulfillments-create`
   - Format: JSON
   - API Version: 2024-10
   
   **Order Paid** (optional):
   - Topic: `orders/paid`
   - URL: `https://your-domain.com/webhooks/orders-paid`
   - Format: JSON
   - API Version: 2024-10

3. **Copy the Webhook Signing Secret** for HMAC verification

**Local Development:**
- Skip webhooks for now
- Use test endpoints: `/api/test/seed`, `/api/test/mock-fulfillment`
- Or use ngrok to expose localhost for webhook testing

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
3. **Test endpoint**

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

#### Quick Start with Helper Scripts (Recommended)

The project includes three helper scripts for easy management:

**1. setup.sh** - Interactive Setup Wizard
```bash
chmod +x setup.sh
./setup.sh
```
- Checks Node.js version and prerequisites
- Installs dependencies automatically
- Guides through .env configuration
- Optionally builds the project

**2. verify.sh** - Production Readiness Check
```bash
chmod +x verify.sh
./verify.sh
```
- Verifies all files and directories exist
- Checks dependencies are installed
- Validates .env configuration
- Ensures build files are present
- Confirms git setup is correct

**3. run.sh** - Application Manager
```bash
chmod +x run.sh

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
./setup.sh       # Interactive setup
./verify.sh      # Verify everything is ready
./run.sh build   # Build the project
./run.sh start   # Start with PM2

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

# 5. Verify production readiness anytime
./verify.sh
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

#### Seed Test Data (Uses Your Real Shopify Orders)
```bash
curl -X POST http://localhost:3000/api/test/seed
```

**What this tests:**
- ✅ Fetches 3 most recent orders from **your connected Shopify store**
- ✅ Creates test data with **real order IDs** (works with any Shopify store)
- ✅ All orders have placeholder labels
- ✅ Order details dialog works (shows real products, customer info, etc.)
- ✅ Tests the complete UI with realistic data

**Use this when:** You want to test with real order data but without generating actual shipping labels.

**⚠️ Requires:** At least 1 order in your Shopify store.

---

#### Generate One Mock Order (Fake Data)
```bash
curl -X POST http://localhost:3000/api/test/mock-fulfillment
```

**What this tests:**
- ✅ Simulates the complete order workflow with **fake/generated data**
- ✅ Tests real-time WebSocket updates
- ✅ Tests status transitions (pending → label_created → printed)
- ✅ Uses placeholder labels
- ❌ Order details dialog will fail (fake order ID doesn't exist in Shopify)

**Simulated flow:**
1. Order received (2s)
2. Label created (2s)
3. Print started (3s)
4. Print completed

**Use this when:** You want to test the workflow/UI behavior without any Shopify connection.

---

#### Auto-Generate Orders (Fake Data, Continuous)
```bash
# Start auto-generation
curl -X POST "http://localhost:3000/api/test/auto-generate/start?interval=30"

# Stop auto-generation
curl -X POST http://localhost:3000/api/test/auto-generate/stop
```

**What this tests:**
- ✅ Continuously generates **fake orders** every 30 seconds
- ✅ Tests dashboard performance with multiple orders
- ✅ Tests real-time updates under load
- ✅ Simulates busy store environment
- ❌ Order details dialog will fail (fake order IDs)

**Use this when:** You want to test dashboard behavior with many orders appearing automatically.

#### MakeCommerce Test Environment (Real Label Generation)

Test with **real MakeCommerce API** using their test environment. These endpoints generate actual shipping labels and create orders in the dashboard:

```bash
# Test DPD Lithuania label
curl -X POST http://localhost:3000/api/test/makecommerce/dpd \
  -H 'Content-Type: application/json'

# Test OMNIVA label
curl -X POST http://localhost:3000/api/test/makecommerce/omniva \
  -H 'Content-Type: application/json'

# Test both carriers at once
curl -X POST http://localhost:3000/api/test/makecommerce/both \
  -H 'Content-Type: application/json'
```

**⚠️ Note about Order Details:**
- These test orders use MakeCommerce's mock shop credentials
- When you click on these orders in the dashboard, **"Order Details Failed to Load"** will appear
- This is expected - the orders don't exist in your actual Shopify store
- **You can still test the printing functionality** with the real labels generated

**What you can test:**
- ✅ Real label generation from MakeCommerce test API
- ✅ PDF download and viewing
- ✅ Printing with real label files
- ✅ WebSocket real-time updates
- ❌ Order details (product images, customer info) - not available for test orders

**Use Case:** Perfect for testing the complete label printing workflow without creating real orders in your Shopify store.

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
GET  /api/orders/:shopifyOrderId      # Get detailed order information from Shopify
GET  /api/print-jobs                  # Get all print jobs  
GET  /api/printer-status              # Get printer status
POST /api/print-jobs/:jobId/retry     # Retry a queued/failed print job
```

**Example: Get Order Details**
```bash
# URL-encoded Shopify GID format
curl http://localhost:3000/api/orders/gid:__2F____2F__2FOrder__2F11823591194968

# Response includes:
# - Complete line items with product info
# - Customer details (name, email, phone)
# - Shipping/billing addresses
# - Parcel locker information (if applicable)
# - Order totals and pricing
# - Product images (if read_products scope enabled)
```

**Note**: The `:shopifyOrderId` parameter accepts URL-encoded Shopify GIDs (e.g., `gid://shopify/Order/123` → `gid:__2F____2F__2FOrder__2F123`) or plain numeric IDs.

### Webhooks

```
POST /webhooks/fulfillments-create  # Shopify fulfillment webhook
POST /webhooks/orders-paid          # Shopify order paid webhook
```

### Test/Mock Endpoints

```
POST /api/test/seed                      # Seed test data with recent orders from your Shopify store
GET  /api/test/shopify-orders            # List recent orders from Shopify (for testing)
POST /api/test/mock-fulfillment          # Generate one mock order (fake data)
POST /api/test/auto-generate/start       # Start auto-generation (fake data)
POST /api/test/auto-generate/stop        # Stop auto-generation
POST /mock/printer-status                # Toggle printer (online/offline/error)
POST /mock/printnode/jobs                # Create print job (manual print)

# MakeCommerce Test API (generates REAL labels with test credentials)
POST /api/test/makecommerce/dpd          # Create real DPD Lithuania test label
POST /api/test/makecommerce/omniva       # Create real OMNIVA test label
POST /api/test/makecommerce/all          # Create both DPD and OMNIVA test labels
```

**Seed Test Data**: The `/api/test/seed` endpoint automatically fetches the 3 most recent orders from your connected Shopify store, making it work with any Shopify store without hardcoded order IDs. If your store has no orders yet, the endpoint will return an error asking you to create at least one order first.

**MakeCommerce Test Endpoints**: These endpoints use MakeCommerce's **test environment** with test credentials to generate **real PDF labels** that can be downloaded and printed. This is useful for:
- Testing the complete label generation flow without real orders
- Verifying carrier API integrations (DPD_LT, OMNIVA)
- Testing printer connectivity with actual label PDFs
- Demo purposes

**Example**:
```bash
# Create a DPD Lithuania test label
curl -X POST http://localhost:3000/api/test/makecommerce/dpd

# Create an OMNIVA test label
curl -X POST http://localhost:3000/api/test/makecommerce/omniva

# Create both
curl -X POST http://localhost:3000/api/test/makecommerce/all
```

Response includes:
- Order ID
- Label URL (downloadable PDF)
- Tracking number
- Print job status

### WebSocket

```
ws://localhost:3000/ws

Message types:
- order_update     # Order status changed
- print_update     # Print job status changed
- printer_status   # Printer connectivity changed
- data_cleared     # Data cleared (triggers UI refresh)
```

---

## 🎨 Order Details Dialog

### Overview

Click on any order in the dashboard to open a comprehensive dialog showing all order information fetched directly from Shopify.

### Features

**Product Information**:
- Product thumbnails (when `read_products` API scope is enabled)
- Product titles and variant names
- Quantities and individual prices
- SKUs
- Total prices per line item

**Customer Information**:
- Customer name (or "Guest Customer" if not provided)
- Email address (if available)
- Phone number (if available)

**Shipping Information**:
- **Regular Shipping**: Full address with name, street, city, postal code, country
- **Parcel Locker**: Automatically detects and displays:
  - Locker name (e.g., "Utenos RIMI-SENUKAI paštomatas")
  - Locker ID
  - Address and location
  - City and postal code

**Order Summary**:
- Order number
- Order status
- Carrier information
- Tracking number
- Locker ID (if applicable)
- Creation timestamp

**Actions**:
- Download label (if available)
- View label in new tab
- Manual print trigger

### How It Works

1. **User clicks order** → Dialog opens with loading state
2. **Frontend calls API** → `GET /api/orders/:shopifyOrderId`
3. **Backend fetches from Shopify** → Shopify Admin API (version 2024-10)
4. **Data enrichment** → Attempts to fetch product images (requires `read_products` scope)
5. **Response returned** → Full order details with line items
6. **UI renders** → Products, customer, shipping/parcel locker info displayed

### Parcel Locker Detection

The system automatically detects parcel locker deliveries by checking the `note_attributes` field in Shopify orders:

```typescript
// Expected note_attributes for parcel locker orders
[
  { name: "parcelName", value: "Utenos RIMI-SENUKAI paštomatas" },
  { name: "parcelId", value: "88860" },
  { name: "address", value: "J. Basanavičiaus g. 52" },
  { name: "city", value: "Utenos apskr." },
  { name: "zip", value: "88860" }
]
```

**Display Logic**:
- If `parcelName` exists → Shows parcel locker information
- If `parcelName` is missing → Shows regular shipping address
- Handles missing customer data gracefully (shows "Guest Customer")

### API Scope Requirements

| Feature | Required Scope | Behavior Without Scope |
|---------|----------------|------------------------|
| Order details | `read_orders` | ❌ Won't work |
| Customer info | `read_orders` | ❌ Won't work |
| Shipping address | `read_shipping` | ❌ Won't work |
| Product images | `read_products` | ⚠️ Works but no images shown |

**Important**: The dialog works perfectly without `read_products`, but product images won't be displayed. All other features remain fully functional.

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

## 🔧 Troubleshooting

### Node.js Version Issues

**Symptom**: `npm run build` or `./run.sh build` fails with errors about unsupported Node version.

**Root Cause**: You're using Node 17.9.1 which can't build the frontend (Vite 7 + React 19 require Node 18+).

**Solutions**:

**Option 1: Use pre-built files (Node 17.9.1 users)**
```bash
# Pre-built files are already in the repository, just run:
npm install
cd frontend && npm install && cd ..

# Then start (choose one):
npm start            # Direct start
./run.sh start       # PM2 background (recommended for production)
./run.sh prod        # Foreground mode

# These also work on Node 17.9.1:
./run.sh status      # Check status
./run.sh logs        # View logs
./run.sh restart     # Restart
./run.sh stop        # Stop
```

**Option 2: Upgrade to Node 18+ (for development/building)**
```bash
# Using nvm
nvm install 18
nvm use 18

# Now you can use ALL commands:
./setup.sh           # Interactive setup
./run.sh build       # Build from source
./run.sh dev         # Development mode
npm run build        # Manual build
```

**What works on each Node version:**

| Command | Node 17.9.1 | Node 18+ |
|---------|-------------|----------|
| `npm start` | ✅ Yes | ✅ Yes |
| `./run.sh start` | ✅ Yes | ✅ Yes |
| `./run.sh prod` | ✅ Yes | ✅ Yes |
| `./run.sh status/logs/restart/stop` | ✅ Yes | ✅ Yes |
| `npm run build` | ❌ No | ✅ Yes |
| `./run.sh build` | ❌ No | ✅ Yes |
| `./run.sh dev` | ❌ No | ✅ Yes |
| `./setup.sh` | ❌ No | ✅ Yes |

**Note**: The application **runs perfectly** on Node 17.9.1+ for production use - you just can't rebuild it.

---

### Product Images Not Showing in Order Details

**Symptom**: Order details dialog shows product information but images are missing (broken image icons or no image displayed).

**Root Cause**: Your Shopify API token doesn't have the `read_products` scope enabled.

**Solutions**:

1. **Enable the read_products scope** (Recommended):
   ```
   a. Go to Shopify Admin → Settings → Apps and sales channels
   b. Find your custom app (the one with the API token)
   c. Click "Edit scopes"
   d. Enable "read_products"
   e. Save and re-approve the app
   ```

2. **Accept the limitation**: The dialog works perfectly without product images. All other features remain functional:
   - ✅ Product names and variants
   - ✅ Quantities and prices
   - ✅ SKUs
   - ✅ Customer information
   - ✅ Shipping/parcel locker details
   - ❌ Product thumbnail images only

**Verification**:
```bash
# Test if your token has read_products scope
curl -H "X-Shopify-Access-Token: YOUR_TOKEN" \
  https://YOUR_STORE.myshopify.com/admin/api/2024-10/products.json?limit=1
```

If you see an empty products array `{"products":[]}` or 401 error, the scope is missing.

---

### Orders Not Loading

**Symptom**: Dashboard shows "No orders yet" or error messages.

**Check**:
1. Verify Shopify webhook is configured correctly
2. Check backend logs: `./run.sh logs` or `pm2 logs`
3. Test seed data: `curl -X POST http://localhost:3000/api/test/seed`
4. Verify WebSocket connection in browser console

**Solution**:
```bash
# Restart the backend
./run.sh restart

# Clear browser cache and reload
```

---

### Parcel Locker Information Not Showing

**Symptom**: Shipping address shows regular address instead of parcel locker details.

**Root Cause**: Parcel locker information is stored in Shopify's `note_attributes` field.

**Check**:
1. Verify your checkout flow adds these note_attributes:
   - `parcelName` (e.g., "Utenos RIMI-SENUKAI paštomatas")
   - `parcelId` (locker ID)
   - `address`, `city`, `zip`

2. Test with real order:
   ```bash
   curl http://localhost:3000/api/orders/gid:__2F____2FOrder__2F11823591194968
   ```

**Expected note_attributes**:
```json
"note_attributes": [
  {"name": "parcelName", "value": "Utenos RIMI-SENUKAI paštomatas"},
  {"name": "parcelId", "value": "88860"},
  {"name": "address", "value": "J. Basanavičiaus g. 52"},
  {"name": "city", "value": "Utenos apskr."},
  {"name": "zip", "value": "88860"}
]
```

---

### WebSocket Connection Failed

**Symptom**: Real-time updates not working, console shows WebSocket errors.

**Check**:
```bash
# Test WebSocket endpoint
wscat -c ws://localhost:3000/ws

# Or in browser console
const ws = new WebSocket('ws://localhost:3000/ws');
ws.onopen = () => console.log('Connected');
ws.onerror = (e) => console.error('Error:', e);
```

**Solution**:
1. Ensure backend is running: `./run.sh status`
2. Check firewall isn't blocking WebSocket connections
3. If using reverse proxy (Nginx), verify WebSocket headers are configured

---

### Printer Not Detected

**Symptom**: Printer shows as offline or not detected.

**Check**:
1. Verify PrintNode is running and computer is online
2. Check `PRINTNODE_API_KEY` in `.env`
3. Verify `PRINTER_ID` matches your PrintNode printer ID

**Get PrintNode Printer ID**:
```bash
curl -u YOUR_API_KEY: https://api.printnode.com/printers
```

**Test printer status**:
```bash
curl http://localhost:3000/api/printer-status
```

---

### Domain Conversion Issues

**Symptom**: Shopify API calls fail with domain-related errors.

**Root Cause**: The system needs to convert your custom domain to `*.myshopify.com` format.

**Check `backend/src/services/shopify.service.ts`**:
```typescript
private getShopifyDomain(originalDomain: string): string {
  // Should handle: doshabliss.lt → doshabliss.myshopify.com
  if (originalDomain.includes('.myshopify.com')) {
    return originalDomain;
  }
  const subdomain = originalDomain.split('.')[0];
  return `${subdomain}.myshopify.com`;
}
```

**Verify**:
```bash
# Check SHOPIFY_SHOP_DOMAIN in .env
echo $SHOPIFY_SHOP_DOMAIN
# Should be: yourstore.myshopify.com (NOT your custom domain)
```

---

### Labels Not Generating

**Symptom**: Orders show "Pending" but labels never generate.

**Check**:
1. Verify MakeCommerce credentials in `.env`
2. Check if fulfillment webhook is firing
3. Review backend logs for API errors

**Test MakeCommerce connection**:
```bash
# Check the logs when order is created
./run.sh logs
```

**Look for**:
- `✅ Destination ID resolved`
- `✅ Shipment created successfully`
- `✅ Label generated for order`

---

### Test Data Using Fake Order IDs

**Symptom**: Order details fail with 404 errors when clicking test orders.

**Solution**: The seed endpoint now automatically fetches real orders from your connected Shopify store:

```bash
# Seed with your actual Shopify orders
curl -X POST http://localhost:3000/api/test/seed

# This will:
# 1. Fetch the 3 most recent orders from your Shopify store
# 2. Create test data using those real order IDs
# 3. Work with any Shopify store automatically
```

**Requirements**:
- Your Shopify store must have at least 1 order
- Shopify API credentials must be configured in `.env`
- The `read_orders` scope must be enabled

If you see "No orders found in your Shopify store", create at least one test order in your Shopify admin before seeding.

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
