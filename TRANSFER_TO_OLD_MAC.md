# Transfer Built Application to Old Mac

Since npm is having persistent cache corruption issues on macOS 10.13.6, here's a better approach: **build on your working Mac, transfer the built files**.

## Option 1: Transfer Pre-Built Frontend (Recommended) ✅

### On Your Working Mac (merkelis-p's Mac):

```bash
cd ~/dosha/label-automation

# Build the frontend
cd frontend && npm run build && cd ..

# Build the backend
npm run build:backend

# Create a transfer package (excludes node_modules)
tar -czf label-automation-built.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.log' \
  backend/dist \
  frontend/dist \
  package.json \
  ecosystem.config.cjs \
  .env.example \
  run.sh \
  setup.sh \
  verify.sh \
  README.md \
  QUICKSTART.md \
  DEPLOYMENT.md \
  PRINTNODE_SETUP.md \
  public \
  logs

# Transfer this file to the old Mac (via USB, AirDrop, cloud, etc.)
# File location: ~/dosha/label-automation/label-automation-built.tar.gz
```

### On the Old Mac (AGRIRAs-MacBook-Air):

```bash
# Extract the package
cd ~/label-automation
tar -xzf ~/label-automation-built.tar.gz

# Install ONLY backend dependencies (frontend is pre-built)
npm install --production

# Copy your .env file (if you haven't already)
cp .env.example .env
nano .env  # Edit with your credentials

# Install PM2 for production
npm install -g pm2
# Or with sudo if needed:
# sudo npm install -g pm2
```

### Run the Application:

```bash
# Start with PM2
pm2 start ecosystem.config.cjs

# Or start manually
node backend/dist/server.js
```

The frontend is already built in `frontend/dist`, so the backend will serve it automatically!

---

## Option 2: Full Transfer with node_modules (Not Recommended)

⚠️ **Warning**: This probably won't work due to binary incompatibility between Node.js v16 and v18+, and macOS 10.13 vs newer macOS.

### On Your Working Mac:

```bash
cd ~/dosha/label-automation

# Create full archive INCLUDING node_modules
tar -czf label-automation-full.tar.gz \
  --exclude='.git' \
  --exclude='*.log' \
  .

# This will be HUGE (200-500 MB) and take time
# Transfer to old Mac
```

### On Old Mac:

```bash
cd ~
tar -xzf label-automation-full.tar.gz
cd label-automation

# Try to run - it might fail with binary errors
./run.sh start
```

---

## Option 3: Git Clone + Use Pre-Built (Best)

### On Your Working Mac:

```bash
cd ~/dosha/label-automation

# Build everything
npm run build

# Commit the built files (temporarily)
git add -f frontend/dist backend/dist
git commit -m "Add built files for old Mac"
git push
```

### On Old Mac:

```bash
cd ~/label-automation

# Pull the latest (with built files)
git pull

# Install only production backend dependencies
npm install --production --legacy-peer-deps

# Set up .env
cp .env.example .env
nano .env

# Run
npm start
```

### Cleanup (On Working Mac):

```bash
# Remove built files from git
git rm -r --cached frontend/dist backend/dist
git commit -m "Remove built files"
git push
```

---

## Verification

After transfer, verify on the old Mac:

```bash
cd ~/label-automation

# Check backend build exists
ls -la backend/dist/server.js

# Check frontend build exists
ls -la frontend/dist/index.html

# Check .env is configured
cat .env

# Start the server
node backend/dist/server.js
```

---

## Network Access

The frontend is served by the backend on `http://localhost:3001`

To access from another device on the same network, find the old Mac's IP:

```bash
ifconfig | grep "inet "
```

Then access: `http://[OLD_MAC_IP]:3001`

---

## Troubleshooting

**Error: "Cannot find module"**
- Make sure `backend/dist` exists
- Run `npm install --production` in the root directory

**Frontend not loading**
- Check that `frontend/dist` exists
- Check backend logs: `pm2 logs` or console output

**Port already in use**
- Kill existing process: `lsof -ti:3001 | xargs kill -9`
- Or change port in `.env`: `PORT=3002`

**PM2 command not found**
- Install globally: `npm install -g pm2`
- Or with sudo: `sudo npm install -g pm2`

---

This approach bypasses the npm cache corruption issues entirely! 🎉
