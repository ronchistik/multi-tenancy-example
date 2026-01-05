# Quick Start Guide

Get the Odynn multi-tenant platform running in **3 minutes**.

---

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (`npm install -g pnpm`)

---

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Create .env file (optional - has defaults)
cp .env.example .env
```

### What's in `.env`?

The root `.env` file contains all configuration for both backend and frontend:

```env
# Backend API Configuration
PORT=3001
NODE_ENV=development

# Database
DB_PATH=./apps/backend/data/configs.db

# External API Keys (Duffel)
DUFFEL_API_KEY=your_duffel_api_key_here

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info

# Frontend Configuration
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Odynn Travel Platform
VITE_APP_ENV=development
```

```bash
# 3. Start both backend and frontend
pnpm dev
```

> **Note:** SQLite database auto-creates at `apps/backend/data/configs.db` on first run. No database setup required.

---

## Access

**Frontend:** http://localhost:5173  
**API:** http://localhost:3001

---

## Test the Tenants

### 1. SaverTrips (Student Budget App)

- **Color:** Green
- **Verticals:** Flights only (Hotels disabled)
- **Layout:** Cards with big prices
- **Try:** Search JFK → LAX, see economy-only results

### 2. Apex Reserve (Luxury Concierge)

- **Color:** Purple
- **Verticals:** Flights + Hotels
- **Layout:** Cards with quality emphasis
- **Try:** Search hotels in NYC, see only 4+ star results

### 3. Globex Systems (Corporate Travel)

- **Color:** Blue
- **Verticals:** Flights + Hotels
- **Layout:** Dense table
- **Try:** Search flights, see ✓ on AA/UA/DL (preferred airlines)

---

## API Examples

### Get tenant config

```bash
curl -H "X-Tenant-Id: saver-trips" http://localhost:5050/api/config
```

### Search flights

```bash
curl -X POST http://localhost:5050/api/flights/search \
  -H "X-Tenant-Id: apex-reserve" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "JFK",
    "destination": "LAX",
    "departureDate": "2025-01-15",
    "passengers": 2
  }'
```

### Search hotels

```bash
curl -X POST http://localhost:5050/api/stays/search \
  -H "X-Tenant-Id: globex-systems" \
  -H "Content-Type: application/json" \
  -d '{
    "locationId": "nyc",
    "checkInDate": "2025-01-15",
    "checkOutDate": "2025-01-18",
    "guests": 2,
    "rooms": 1
  }'
```

---

## Project Structure

```
odynn/
├─ apps/
│  ├─ backend/          # Backend (Fastify + SQLite)
│  │  ├─ src/
│  │  │  ├─ api/        # Routes, schemas, plugins
│  │  │  ├─ domain/     # Business logic (flights, stays)
│  │  │  ├─ platform/   # Tenants, policies, locations
│  │  │  └─ providers/  # External APIs (Duffel)
│  │  └─ data/          # SQLite database (auto-created)
│  └─ frontend/         # Frontend (React + Craft.js)
│     ├─ src/
│     │  ├─ components/ # Organized by domain
│     │  │  ├─ common/  # Layout, RenderNode
│     │  │  ├─ features/ # FeatureCards
│     │  │  ├─ flights/ # Flight components
│     │  │  ├─ stays/   # Stay components
│     │  │  ├─ tenant/  # TenantPicker
│     │  │  ├─ theme/   # ThemeEditor
│     │  │  └─ ui/      # Button, Text, etc.
│     │  └─ pages/      # Page components
├─ docs/                # Documentation
│  ├─ DESIGN.md         # Architecture deep-dive
│  └─ QUICKSTART.md     # This file
├─ .env.example         # Environment config
└─ README.md            # Full documentation
```

---

## Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env file
PORT=3002
```

**Missing dependencies:**
```bash
pnpm install
```

---

## Next Steps

1. Read [README.md](../README.md) for full documentation
2. Read [DESIGN.md](./DESIGN.md) for architecture details
3. Explore the codebase:
   - `apps/backend/src/platform/tenant/tenant.registry.ts` - Tenant configs
   - `apps/backend/src/platform/policies/` - Policy engine
   - `apps/frontend/src/components/` - Organized UX components
4. Inspect the database:
   ```bash
   sqlite3 apps/backend/data/configs.db ".tables"
   ```

---

**Ready to ship!** 🚀

