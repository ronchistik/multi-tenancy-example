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

# 2. Create .env file in project root
# Replace with actual Duffel keys from the assignment email
cat > .env << 'EOF'
API_PORT=5050
API_HOST=0.0.0.0
NODE_ENV=development
DUFFEL_KEY_SAVER_TRIPS=duffel_test__YOUR_KEY_HERE
DUFFEL_KEY_APEX_RESERVE=duffel_test__YOUR_KEY_HERE
DUFFEL_KEY_GLOBEX_SYSTEMS=duffel_test__YOUR_KEY_HERE
EOF

# 3. Start both API and frontend
pnpm dev
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

## Run Tests

```bash
pnpm test
```

---

## Project Structure

```
odynn/
├─ apps/
│  ├─ api/           # Backend (Fastify)
│  └─ web/           # Frontend (React)
├─ README.md         # Full documentation
├─ DESIGN.md         # Architecture deep-dive
├─ PROMPTS.md        # AI tool usage
└─ SUBMISSION.md     # Submission checklist
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

---

## Next Steps

1. Read [README.md](./README.md) for full documentation
2. Read [DESIGN.md](./DESIGN.md) for architecture details
3. Explore the codebase:
   - `apps/api/src/platform/tenant/tenant.registry.ts` - Tenant configs
   - `apps/api/src/platform/policies/` - Policy engine
   - `apps/web/src/components/` - UX components

---

**Ready to ship!** 🚀

