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

# 2. Create .env files (optional - has defaults)
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
# Then edit with actual Duffel keys if needed

# 3. Start both API and frontend
pnpm dev
```

> **Note:** SQLite database auto-creates at `apps/backend/data/configs.db` on first run. No database setup required.

### .env file format

```env
API_PORT=5050
API_HOST=0.0.0.0
NODE_ENV=development
DUFFEL_KEY_SAVER_TRIPS=duffel_test__YOUR_KEY_HERE
DUFFEL_KEY_APEX_RESERVE=duffel_test__YOUR_KEY_HERE
DUFFEL_KEY_GLOBEX_SYSTEMS=duffel_test__YOUR_KEY_HERE
```

---

## Access

**Frontend:** http://localhost:3000  
**API:** http://localhost:5050

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

## Run Tests & Linting

```bash
# Run tests
pnpm test

# Type checking
pnpm type-check

# Lint code
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Format code with Prettier
pnpm format
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
│  │  ├─ data/          # SQLite database (auto-created)
│  │  └─ .env.example
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
│     └─ .env.example
├─ docs/                # Documentation
│  ├─ DESIGN.md         # Architecture deep-dive
│  └─ QUICKSTART.md     # This file
├─ .prettierrc          # Prettier config
├─ eslint.config.js     # ESLint config (root)
└─ README.md            # Full documentation
```

---

## Troubleshooting

**Port already in use:**
```bash
# Change ports in .env
API_PORT=5051
```

**Missing dependencies:**
```bash
pnpm install
```

**Type errors:**
```bash
pnpm type-check
```

**Linting errors:**
```bash
pnpm lint
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

