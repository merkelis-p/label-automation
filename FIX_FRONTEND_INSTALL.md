# Fix Frontend Installation on macOS 10.13.6

## The Problem
You're seeing npm cache corruption errors when installing frontend dependencies. This is common on older macOS versions.

## Quick Fix (Run these commands on AGRIRAs-MacBook-Air)

```bash
cd ~/label-automation

# 1. Clear npm cache completely
npm cache clean --force

# 2. Remove any partial installations
rm -rf frontend/node_modules
rm -rf frontend/package-lock.json

# 3. Try installing frontend dependencies again with increased timeout
cd frontend
npm install --fetch-timeout=60000 --fetch-retries=5

# If that still fails, try with legacy peer deps
npm install --legacy-peer-deps --fetch-timeout=60000 --fetch-retries=5

# 4. Go back to root
cd ..
```

## If the Above Doesn't Work

Try installing dependencies one at a time (slower but more reliable):

```bash
cd ~/label-automation/frontend

# Clear everything
rm -rf node_modules package-lock.json

# Install core dependencies first
npm install react react-dom --legacy-peer-deps
npm install vite @vitejs/plugin-react --legacy-peer-deps
npm install typescript --legacy-peer-deps

# Then install the rest
npm install --legacy-peer-deps
```

## Alternative: Transfer node_modules from Working Mac

Since you mentioned trying to transfer node_modules, here's the RIGHT way to do it:

**⚠️ WARNING:** Don't commit `node_modules` to Git! It's huge and platform-specific.

**Instead, on your working Mac (merkelis-p's Mac):**

1. Create a compressed archive:
```bash
cd ~/dosha/label-automation
tar -czf label-automation-deps.tar.gz node_modules frontend/node_modules
```

2. Transfer via USB drive, AirDrop, or network:
```bash
# Example: Upload to a cloud service, or use scp
# scp label-automation-deps.tar.gz agrira@192.168.x.x:~/
```

**On the old Mac (AGRIRAs-MacBook-Air):**

3. Extract the archive:
```bash
cd ~/label-automation
tar -xzf ~/label-automation-deps.tar.gz
```

**However, this might NOT work because:**
- Node.js v16 vs v18+ binary compatibility issues
- macOS 10.13 vs newer macOS binary differences
- Native modules (like `esbuild`) are platform-specific

## Recommended: Just Keep Trying npm install

The corrupted tarball errors are usually temporary network/cache issues:

```bash
cd ~/label-automation

# Clear cache
npm cache clean --force

# Try again
cd frontend && npm install --legacy-peer-deps --fetch-timeout=120000
```

## If All Else Fails: Downgrade Frontend Dependencies

Edit `frontend/package.json` to use older, compatible versions:

```bash
cd ~/label-automation/frontend
nano package.json
```

Replace the devDependencies versions with Node 16-compatible ones, or just remove the problematic packages temporarily.

## After Successful Installation

```bash
cd ~/label-automation
./setup.sh
```

Good luck! The npm cache issue is annoying but usually resolves with retries and cache clearing.
