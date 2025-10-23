# Pre-built Backend Files

This directory contains **pre-built backend files** (compiled TypeScript) that are intentionally committed to the repository.

## Why?

**Convenience**: Users can skip the build step entirely and run the app immediately with `npm start`.

## What's Inside

- Compiled JavaScript from TypeScript source (`backend/src/`)
- ES Modules (ESNext format)
- Source maps for debugging
- Type declaration files (`.d.ts`)

## For All Users

✅ **You can skip the build step!**

```bash
npm install
npm start  # Uses these pre-built files
```

## For Developers

If you make backend code changes, rebuild:

```bash
npm run build:backend  # Updates these files
# or
npm run build  # Builds both backend and frontend
```

## Note

While TypeScript compilation works on Node 17.9.1+, including pre-built files means users don't have to wait for compilation - the app starts instantly!
