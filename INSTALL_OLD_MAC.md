# Installation Guide for macOS 10.13.6 (High Sierra)

## ⚠️ Important Notice

Your Mac is running macOS 10.13.6 High Sierra, which has limited support for modern Node.js versions. This guide provides specific instructions for your system.

## The Problem

- **Node.js v18+** (required by this project) doesn't officially support macOS 10.13.6
- **Homebrew** has deprecated support for macOS 10.13.6
- Your current **Node.js v17.9.1** is too old and has compatibility issues

## Solutions

### Option 1: Install Node.js v16 (Recommended for Old Mac) ⭐

Node.js v16 is the last LTS version that supports macOS 10.13.6. While this project is designed for v18+, I'll help you make it work with v16.

#### Step 1: Install Node.js v16

**Using the installer (easiest):**

1. Download Node.js v16.20.2 (last v16 release) from:
   - Intel Mac: https://nodejs.org/dist/v16.20.2/node-v16.20.2.pkg
   - Direct link: https://nodejs.org/download/release/v16.20.2/

2. Run the installer package

3. Verify installation:
   ```bash
   node -v  # Should show v16.20.2
   npm -v   # Should show 8.19.4
   ```

**Or using Homebrew (if it still works):**

```bash
# Try to install node@16 (Homebrew may complain but try anyway)
brew install node@16
brew link node@16 --force --overwrite
```

#### Step 2: Clean up your current installation

```bash
cd ~/label-automation

# Remove corrupted node_modules
rm -rf node_modules
rm -rf frontend/node_modules
rm -rf package-lock.json
rm -rf frontend/package-lock.json
```

#### Step 3: Modify the project for Node.js v16 compatibility

The project needs a small tweak. Run these commands:

```bash
cd ~/label-automation

# Update package.json to allow Node.js v16
sed -i.bak 's/">=18.0.0"/">=16.0.0"/' package.json

# Update setup.sh to allow Node.js v16
sed -i.bak 's/NODE_MAJOR" -lt 18/NODE_MAJOR" -lt 16/' setup.sh
```

#### Step 4: Install dependencies

```bash
npm install
cd frontend && npm install && cd ..
```

#### Step 5: Run the setup

```bash
./setup.sh
```

---

### Option 2: Upgrade macOS (Best Long-term Solution)

If your Mac supports it, upgrade to a newer macOS version:

- **Check compatibility**: Your Mac model determines the maximum supported macOS
- **MacBook Air 2012-2017**: Supports up to macOS 12 Monterey
- **MacBook Air 2018+**: Supports macOS 13+ Ventura

**To upgrade:**
1. Open App Store
2. Search for "macOS" 
3. Download the newest version your Mac supports
4. After upgrading, install Node.js v18+ normally

---

### Option 3: Use a Different Computer

If upgrading isn't possible and Node.js v16 doesn't work:
- Use a newer Mac or PC
- Use a cloud VM (AWS, DigitalOcean, etc.)
- Use GitHub Codespaces

---

## Quick Fix: Manual Installation Steps

If the automatic setup doesn't work, follow these manual steps:

### 1. Install Node.js v16.20.2
Download and install from: https://nodejs.org/dist/v16.20.2/node-v16.20.2.pkg

### 2. Clean install
```bash
cd ~/label-automation
rm -rf node_modules frontend/node_modules package-lock.json frontend/package-lock.json
npm install
cd frontend && npm install && cd ..
```

### 3. Create .env file manually
```bash
cp .env.example .env
nano .env  # Edit with your credentials
```

### 4. Build the project
```bash
npm run build
```

### 5. Run the application
```bash
# Development mode (simpler, no PM2 needed)
npm run dev:backend &
cd frontend && npm run dev

# Or production mode (requires PM2)
npm install -g pm2
pm2 start ecosystem.config.cjs
```

---

## Troubleshooting

### Error: "Cannot find module './build/index.cjs'"
This is because Node.js v17 has compatibility issues. Upgrade to v16.20.2.

### Error: "pm2: command not found"
Install PM2 globally:
```bash
npm install -g pm2
```

If you get EACCES errors, use:
```bash
sudo npm install -g pm2
```

### Error: "EACCES: permission denied"
For global npm packages on older macOS, you may need sudo:
```bash
sudo npm install -g pm2
sudo npm install -g concurrently
```

Or fix npm permissions:
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bash_profile
source ~/.bash_profile
```

### Homebrew is very slow
On old macOS, Homebrew compiles from source which takes hours. Use the direct Node.js installer instead.

---

## What Node.js Version Should You Use?

| macOS Version | Maximum Node.js Version |
|---------------|-------------------------|
| 10.13 High Sierra | **v16.x** |
| 10.14 Mojave | v18.x |
| 10.15 Catalina | v20.x |
| 11+ Big Sur | v22.x (latest) |

---

## Still Having Issues?

1. **Check your Mac model and year**: About This Mac → Overview
2. **Consider upgrading macOS** if your Mac supports it
3. **Try Node.js v16.20.2** (most compatible with High Sierra)
4. **Contact support** with your specific error messages

---

## After Successful Installation

Once Node.js v16 is installed and dependencies are resolved:

```bash
# Run the setup wizard
./setup.sh

# Start the application
./run.sh dev

# Or in production mode
./run.sh start
```

Good luck! 🍀
