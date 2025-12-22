# Design Document: Odynn Multi-Tenant Travel Platform

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tenant Modeling](#tenant-modeling)
3. [Adding a New Tenant](#adding-a-new-tenant)
4. [API Design](#api-design)
5. [Provider Abstraction](#provider-abstraction)
6. [Policy Engine](#policy-engine)
7. [Frontend UX Strategy](#frontend-ux-strategy)
8. [Tenant Evolution & Backwards Compatibility](#tenant-evolution--backwards-compatibility)
9. [Testing Strategy](#testing-strategy)
10. [Rollout & Versioning](#rollout--versioning)
11. [Future Enhancements](#future-enhancements)
12. [AI Tool Usage](#ai-tool-usage)

---

## Architecture Overview

### High-Level Design

This platform is built as a **modular monolith** with strict layer boundaries. Each layer has a clear responsibility and knows only about the layers below it.

```
┌────────────────────────────────────────────┐
│  Frontend (React)                          │  ← Tenant-aware UI
│  - Reads tenant config from API            │
│  - Renders different layouts per tenant    │
└──────────────┬─────────────────────────────┘
               │ HTTP (X-Tenant-Id header)
┌──────────────▼─────────────────────────────┐
│  API Layer (Fastify)                       │  ← HTTP interface
│  - Tenant resolution middleware            │
│  - Request validation (Zod schemas)        │
│  - Route handlers                          │
└──────────────┬─────────────────────────────┘
               │ TenantContext
┌──────────────▼─────────────────────────────┐
│  Domain Layer                              │  ← Business logic
│  - FlightsService                          │
│  - StaysService                            │
│  - Orchestrates providers + policies       │
└──────────────┬─────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────┐
│ Platform    │  │ Providers   │
│ - Tenants   │  │ - Duffel    │
│ - Policies  │  │ - Future    │
│ - Locations │  │   (Amadeus) │
└─────────────┘  └─────────────┘
```

### Why a Modular Monolith?

**For this assignment scope**, a monolith provides:

✅ **Simplicity:** Single deployment unit, single codebase  
✅ **Strong contracts:** TypeScript enforces layer boundaries  
✅ **Easy local dev:** Run everything with `pnpm dev`  
✅ **Fast iteration:** No network hops between services

**For production scale**, the architecture is designed to:

- Migrate to microservices if needed (each layer → service)
- Extract providers into separate services
- Deploy tenants independently (via config changes, not code)

---

## Tenant Modeling

### Core Tenant Model

```typescript
interface Tenant {
  id: TenantId;                    // Unique identifier
  name: string;                    // Display name
  duffelApiKey: string;            // Provider credentials
  enabledVerticals: Vertical[];    // ['flights', 'stays', ...]
  flightDefaults: FlightDefaults;  // Search defaults
  stayDefaults: StayDefaults;      // Search defaults
  policies: PolicyRule[];          // Business rules
  uxHints: UxHints;                // Frontend rendering hints
}
```

### Design Decisions

#### 1. **In-Memory Registry vs. Database**

**Choice:** In-memory registry (`tenant.registry.ts`)

**Rationale:**
- For 3-10 tenants, a database is overkill
- Configuration changes are infrequent
- Simpler to reason about (no DB migrations)
- Fast lookups (O(1) Map access)

**When to switch to DB:**
- 50+ tenants
- Tenant self-service admin UI
- Dynamic tenant provisioning

#### 2. **Config Files vs. Code**

**Choice:** TypeScript objects in code

**Rationale:**
- Type safety (IDE autocomplete, compile-time checks)
- Easy to version control and review
- No runtime parsing errors
- Can be extracted to JSON/YAML later if needed

**Evolution path:**
```typescript
// Future: Load from database or API
async function loadTenantFromDB(id: string): Promise<Tenant> {
  const row = await db.query('SELECT * FROM tenants WHERE id = ?', [id]);
  return mapRowToTenant(row);
}
```

#### 3. **Tenant Context Propagation**

**Choice:** Explicit `TenantContext` object passed to all domain services

```typescript
interface TenantContext {
  tenant: Tenant;
  requestId: string;
}

// Usage
flightsService.searchFlights(request, context);
```

**Why not global/thread-local?**
- TypeScript has no native async context (like Go's context.Context)
- Explicit is better than implicit
- Easy to test (just pass mock context)

---

## Adding a New Tenant

### Single Source of Truth

All tenants are defined in **one file**:

```
apps/api/src/platform/tenant/tenant.registry.ts
```

This file contains:
- Tenant object definitions (lines 15-130)
- Tenant registry (Map) (lines 135-145)
- Lookup functions (`getTenant`, `getAllTenants`)

### Step-by-Step Guide

#### 1. Add Tenant ID to Type Union

**File:** `apps/api/src/platform/tenant/tenant.types.ts` (line 7)

```typescript
export type TenantId = 
  | 'saver-trips' 
  | 'apex-reserve' 
  | 'globex-systems'
  | 'my-new-tenant';  // ← Add this
```

#### 2. Get Duffel API Key

Add the new tenant's Duffel API key to `.env`:

```env
DUFFEL_KEY_MY_NEW_TENANT=duffel_test_...
```

Update `apps/api/src/shared/env.ts`:

```typescript
const envSchema = z.object({
  ...
  DUFFEL_KEY_MY_NEW_TENANT: z.string().min(1),
});
```

#### 3. Define Tenant Object

**File:** `apps/api/src/platform/tenant/tenant.registry.ts`

```typescript
const MY_NEW_TENANT: Tenant = {
  id: 'my-new-tenant',
  name: 'My New Tenant',
  duffelApiKey: env.DUFFEL_KEY_MY_NEW_TENANT,
  
  // Which verticals are enabled?
  enabledVerticals: ['flights', 'stays'],
  
  // Flight search defaults
  flightDefaults: {
    cabinClass: 'economy',          // Default cabin
    maxResults: 20,                 // Limit results
    preferredAirlines: ['AA', 'UA'], // Optional
    sortOrder: 'price_asc',         // How to sort
  },
  
  // Hotel search defaults
  stayDefaults: {
    minStarRating: 3,               // Filter 3+ stars
    maxNightlyPrice: 200,           // Price cap
    sortOrder: 'price_asc',
    roomsCount: 1,
    guestsCount: 2,
  },
  
  // Business policies
  policies: [
    {
      type: 'preferred_airline',
      value: 'AA,UA',
      message: 'Preferred airlines for corporate travel',
    },
    {
      type: 'price_cap',
      value: 200,
      message: 'Hotel stays capped at $200/night',
    },
  ],
  
  // Frontend UX hints
  uxHints: {
    brandName: 'My New Tenant',
    primaryColor: '#FF6B35',        // Brand color
    layout: 'cards',                // 'cards' | 'table'
    showPolicyCompliance: true,     // Show warnings?
    highlightPreferred: true,       // Highlight preferred options?
    priceEmphasis: 'medium',        // 'high' | 'medium' | 'low'
  },
};
```

#### 4. Register Tenant

**Same file** (`tenant.registry.ts`), add to registry:

```typescript
const TENANT_REGISTRY = new Map<TenantId, Tenant>([
  [SAVER_TRIPS.id, SAVER_TRIPS],
  [APEX_RESERVE.id, APEX_RESERVE],
  [GLOBEX_SYSTEMS.id, GLOBEX_SYSTEMS],
  [MY_NEW_TENANT.id, MY_NEW_TENANT],  // ← Add this line
]);
```

#### 5. Add to Frontend Picker

**File:** `apps/web/src/components/TenantPicker.tsx` (line 7)

```typescript
const TENANTS = [
  { id: 'saver-trips', name: 'SaverTrips' },
  { id: 'apex-reserve', name: 'Apex Reserve' },
  { id: 'globex-systems', name: 'Globex Systems' },
  { id: 'my-new-tenant', name: 'My New Tenant' },  // ← Add this
];
```

### That's It!

**No other code changes needed.** The entire platform automatically:
- ✅ Validates the tenant ID
- ✅ Applies search defaults
- ✅ Evaluates policies
- ✅ Renders correct UX (color, layout)
- ✅ Filters verticals

### Testing Your New Tenant

```bash
# Test the config endpoint
curl -H "X-Tenant-Id: my-new-tenant" http://localhost:5050/api/config

# Search flights
curl -X POST http://localhost:5050/api/flights/search \
  -H "X-Tenant-Id: my-new-tenant" \
  -H "Content-Type: application/json" \
  -d '{"origin":"JFK","destination":"LAX","departureDate":"2025-01-15","passengers":1}'
```

Open the frontend, select your new tenant from the picker, and verify:
- Brand color applied
- Correct layout (cards/table)
- Vertical tabs match `enabledVerticals`
- Search uses your defaults

### Why This Design Works

**Config-Driven Architecture Benefits:**

1. **No Code Changes:** Adding a tenant is pure configuration
2. **Type Safety:** TypeScript ensures tenant ID consistency
3. **Single Source of Truth:** One file to update
4. **Zero Downtime:** New tenants don't affect existing ones
5. **Easy Rollback:** Remove from registry if needed

**What You Don't Need to Touch:**

- ❌ Domain services (flights, stays)
- ❌ Provider adapters (Duffel)
- ❌ API routes
- ❌ Frontend components (except picker)

**This demonstrates platform thinking** - the architecture scales to 100+ tenants without code changes, just config additions.

---

## API Design

### Tenant Representation

**Choice:** `X-Tenant-Id` header

**Alternatives considered:**

| Approach | Pros | Cons |
|----------|------|------|
| **Subdomain** (`saver-trips.api.odynn.com`) | Clean separation, DNS-level routing | Requires wildcard DNS, TLS certs |
| **Path prefix** (`/api/saver-trips/flights`) | Simple | Pollutes URLs, harder to route |
| **Header** (`X-Tenant-Id: saver-trips`) | ✅ Clean, flexible, easy to test | Requires middleware |

**Why headers won?**
- Works with single domain
- Easy to add to API client
- Testable with curl
- Allows future JWT-based auth (embed tenant in token)

### API Contracts

#### Design Principle: **Backend-Driven UX**

The API returns not just data, but also **metadata that drives frontend behavior**:

```json
{
  "tenant": {
    "enabledVerticals": ["flights"],  // Frontend hides "Hotels" tab
    "uxHints": {
      "layout": "cards",              // Frontend uses FlightCards component
      "priceEmphasis": "high"         // Frontend shows big prices
    }
  }
}
```

This avoids hardcoding tenant logic in the frontend.

#### Policy as First-Class Data

Each search result includes policy evaluation:

```json
{
  "offers": [
    {
      "id": "...",
      "price": {...},
      "policy": {
        "compliant": true,
        "violations": [],
        "preferred": true  // Frontend shows ✓ badge
      }
    }
  ]
}
```

**Why?**
- Frontend stays dumb
- Backend owns business rules
- Easy to add new policies without frontend changes

### Versioning Strategy

**Current:** No versioning (v1 implicit in `/api/*`)

**Future:**
- API v2: Add `/api/v2/*` routes
- Support both v1 and v2 simultaneously
- Deprecation path:
  1. Add `X-Api-Deprecated: true` header to v1 responses
  2. Log v1 usage per tenant
  3. Sunset date announced
  4. Remove v1 after 6 months

---

## Provider Abstraction

### Current Architecture

```
Domain Layer (Flights/Stays Services)
    ↓
Provider Interface (FlightSearchParams)
    ↓
Duffel Adapter (DuffelFlightsProvider)
    ↓
Duffel Client (HTTP)
```

### Key Design: **Domain Models ≠ Provider Models**

```typescript
// Domain model (internal)
interface FlightOffer {
  id: string;
  owner: { code?: string; name: string };
  price: { amount: string; currency: string };
  slices: FlightSlice[];
}

// Duffel model (external)
interface DuffelOffer {
  id: string;
  owner: { iata_code?: string; name: string };
  total_amount: string;
  total_currency: string;
  slices: DuffelSlice[];
}
```

**Mapping happens in the adapter:**

```typescript
class DuffelFlightsProvider {
  async searchFlights(params: FlightSearchParams) {
    const duffelResponse = await this.client.post(...);
    return mapDuffelOffersToDomain(duffelResponse.data.offers);
  }
}
```

### Adding a New Provider (e.g., Amadeus)

1. Create `providers/amadeus/amadeus.client.ts`
2. Create `providers/amadeus/amadeus.flights.ts` implementing `FlightSearchParams`
3. Update domain service to choose provider:

```typescript
class FlightsService {
  async searchFlights(request, context) {
    const provider = this.getProvider(context.tenant);
    const results = await provider.searchFlights(request);
    // Apply policies, etc.
  }

  private getProvider(tenant: Tenant): FlightProvider {
    if (tenant.flightProvider === 'amadeus') {
      return new AmadeusFlightsProvider(tenant.amadeusApiKey);
    }
    return new DuffelFlightsProvider(tenant.duffelApiKey);
  }
}
```

**No changes to API layer or frontend required.**

---

## Policy Engine

### Design Philosophy

Policies are **evaluated, not enforced** (except for errors).

```typescript
interface PolicyEvaluation {
  compliant: boolean;       // false = hard block
  violations: Violation[];  // warnings or errors
  preferred?: boolean;      // highlight in UI
}
```

### Policy Types

| Type | Example | Severity | Action |
|------|---------|----------|--------|
| **Preferred** | Preferred airlines (AA, UA) | info | Show ✓ badge |
| **Warning** | Over price cap ($250/night) | warning | Show ⚠️ |
| **Error** | Excluded airline (Spirit) | error | Filter out |

### Policy Evolution

**Current:** Policies are static in `tenant.registry.ts`

**Future:** 
- Dynamic policies loaded from database
- Policy conditions as expressions:

```json
{
  "type": "price_cap",
  "condition": "rate.price.amount > tenant.maxNightlyPrice",
  "message": "Exceeds budget cap",
  "severity": "warning"
}
```

- Admin UI for policy editing
- Policy versioning (effective dates)

---

## Frontend UX Strategy

### Tenant-Driven Rendering

The frontend reads `tenant.uxHints` and chooses components:

```typescript
// TenantShell.tsx
const isTableLayout = config.uxHints.layout === 'table';

{isTableLayout ? (
  <FlightTable offers={offers} config={config} />
) : (
  <FlightCards offers={offers} config={config} />
)}
```

### Component Matrix

| Tenant | Layout | Vertical Tabs | Policy Warnings |
|--------|--------|---------------|-----------------|
| SaverTrips | Cards | Flights only | Hidden |
| Apex Reserve | Cards | Flights + Hotels | Hidden |
| Globex Systems | **Table** | Flights + Hotels | **Shown** |

### UX Hints Catalog

```typescript
interface UxHints {
  brandName: string;          // Header title
  primaryColor: string;       // Theme color
  layout: 'cards' | 'table';  // Layout mode
  showPolicyCompliance: boolean;
  highlightPreferred: boolean;
  priceEmphasis: 'high' | 'medium' | 'low';
}
```

**Adding a new UX hint:**

1. Add to `UxHints` interface
2. Update tenant configs
3. Frontend reads it and changes rendering

No code changes in API or domain layers.

---

## Tenant Evolution & Backwards Compatibility

### Evolution Scenarios

#### 1. **Adding a New Attribute**

**Example:** Add `loyaltyProgram: string` to tenants.

```typescript
interface Tenant {
  ...
  loyaltyProgram?: string;  // Optional = backwards compatible
}
```

**Impact:**
- Old tenants: `undefined` (graceful degradation)
- New tenants: Set value
- Frontend: Check `if (config.loyaltyProgram) { ... }`

#### 2. **Changing an Attribute Type**

**Example:** Change `maxNightlyPrice: number` to `priceRange: { min: number, max: number }`.

**Strategy:**
- Add `priceRange?` as optional
- Deprecate `maxNightlyPrice`
- Support both for 2-3 releases
- Migrate tenants one by one
- Remove `maxNightlyPrice` after migration

#### 3. **Adding a New Vertical**

**Example:** Add `cars` vertical.

**Steps:**
1. Add `'cars'` to `Vertical` type
2. Create `CarDefaults` interface
3. Add `carDefaults?` to `Tenant` (optional)
4. Tenants without cars: leave `enabledVerticals` as-is
5. Tenants with cars: add `'cars'` to array

**Impact:** Zero breaking changes.

### Versioning Strategy

**Tenant config versions:**

```typescript
interface Tenant {
  configVersion: number;  // e.g., 1, 2, 3
  ...
}
```

**Migration function:**

```typescript
function migrateTenantConfig(tenant: any): Tenant {
  if (tenant.configVersion === 1) {
    // Migrate v1 → v2
    tenant.priceRange = { min: 0, max: tenant.maxNightlyPrice };
    delete tenant.maxNightlyPrice;
    tenant.configVersion = 2;
  }
  return tenant;
}
```

---

## Testing Strategy

### Test Pyramid

```
           ┌────────┐
           │  E2E   │  ← Browser tests (Playwright, if needed)
          ┌┴────────┴┐
          │Integration│  ← API tests (supertest, if needed)
         ┌┴───────────┴┐
         │    Unit      │  ← Core logic (policies, services)
         └──────────────┘
```

### What We Test

#### ✅ **Core Logic (Unit Tests)**

- **Policy evaluation** (preferred airlines, price caps, exclusions)
- **Tenant registry** (getTenant, getAllTenants)
- **Sorting/filtering** (price sort, rating sort)

**Example:**

```typescript
it('should reject excluded airline', () => {
  const offer = { owner: { iata_code: 'NK' } };
  const result = evaluateFlightPolicy(offer, tenant);
  expect(result.compliant).toBe(false);
});
```

#### ⚠️ **Integration Tests (Future)**

- **API routes** (full request → response cycle)
- **Duffel provider** (with mocked HTTP)

**Example:**

```typescript
it('should search flights with tenant defaults', async () => {
  const response = await request(app)
    .post('/api/flights/search')
    .set('X-Tenant-Id', 'saver-trips')
    .send({ origin: 'JFK', destination: 'LAX', ... });

  expect(response.status).toBe(200);
  expect(response.body.metadata.appliedDefaults.cabinClass).toBe('economy');
});
```

#### ❌ **E2E Tests (Out of Scope for Assignment)**

- Full browser tests (Playwright)
- Multi-tenant flow (switch tenant → search → verify UX)

### Test Coverage Goals

| Layer | Target Coverage |
|-------|-----------------|
| Platform (policies, tenants) | **90%+** |
| Domain (services) | **80%+** |
| Providers (Duffel adapters) | **60%+** (mocked) |
| API routes | **70%+** (integration tests) |

---

## Rollout & Versioning

### Tenant Rollout Strategy

**Scenario:** Deploy a new feature (e.g., "Direct flights only" filter).

#### Option 1: **Feature Flags**

```typescript
interface Tenant {
  features: {
    directFlightsOnly?: boolean;
  };
}
```

**Rollout:**
1. Deploy code with feature flag
2. Enable for 1 tenant (canary)
3. Monitor metrics
4. Enable for all tenants
5. Remove flag (hardcode as default)

#### Option 2: **Gradual Config Update**

1. Deploy code that respects `flightDefaults.maxStops`
2. Update tenant configs one by one:
   - SaverTrips: `maxStops: undefined` (no change)
   - Globex: `maxStops: 1` (direct or 1 stop)
3. Monitor and adjust

### API Versioning

**Current:** Single version (`/api/*`)

**Future:** Path-based versioning (`/api/v2/*`)

**Tenant-specific API versions:**

```typescript
interface Tenant {
  apiVersion: 'v1' | 'v2';
}
```

Middleware routes requests to correct handler based on tenant config.

### Database Migrations (If We Add a DB)

**Strategy:** Flyway-style versioned migrations

```sql
-- migrations/001_create_tenants.sql
CREATE TABLE tenants (
  id VARCHAR(50) PRIMARY KEY,
  config JSONB NOT NULL
);

-- migrations/002_add_loyalty_program.sql
ALTER TABLE tenants ADD COLUMN loyalty_program VARCHAR(50);
```

**Backwards compatibility:**
- Additive changes only (new columns)
- Default values for old rows
- No breaking schema changes

---

## Future Enhancements

### Phase 2: Tenant Self-Service

**Admin UI for tenants to:**
- Update search defaults (cabin class, max price)
- Configure policies (preferred airlines)
- Customize UX (colors, layout)
- View analytics (popular routes, conversion rates)

### Phase 3: Advanced Policies

**Dynamic policy engine:**
- Time-based rules (peak season price caps)
- User role-based rules (executives can book business class)
- Geo-based rules (flights to certain countries require approval)

**Example:**

```json
{
  "type": "approval_required",
  "condition": "destination.country === 'CN' && price.amount > 2000",
  "message": "Requires manager approval",
  "severity": "error"
}
```

### Phase 4: Analytics & Insights

**Per-tenant dashboards:**
- Search volume
- Conversion rate
- Average booking value
- Popular destinations
- Policy violation rate

### Phase 5: Multi-Provider Support

**Support multiple providers per vertical:**

```typescript
interface Tenant {
  flightProviders: ['duffel', 'amadeus'];
  providerPriority: 'cheapest' | 'fastest' | 'roundrobin';
}
```

**Domain service fans out to multiple providers:**

```typescript
const [duffelResults, amadeusResults] = await Promise.all([
  duffelProvider.search(request),
  amadeusProvider.search(request),
]);

const merged = mergeAndDedupe(duffelResults, amadeusResults);
return sortByPrice(merged);
```

---

## AI Tool Usage

### Tools Used

**Primary:** Claude Code (via Cursor)

**How it helped:**
1. **Scaffolding:** Generated boilerplate for routes, services, components
2. **TypeScript types:** Inferred complex interface shapes from Duffel docs
3. **Test generation:** Created initial test cases for policy logic
4. **Documentation:** Drafted README structure and API examples

### What I Owned

✅ **Architecture decisions** (modular monolith, tenant modeling)  
✅ **Tenant configurations** (3 distinct personas)  
✅ **Policy evaluation logic** (preferred airlines, price caps)  
✅ **API design** (X-Tenant-Id header, policy as first-class data)  
✅ **UX strategy** (cards vs. table, policy warnings)  
✅ **Code review & refinement** (simplified AI-generated code)

### Workflow Example

**Prompt:**
> "Create a Fastify plugin that resolves tenant from X-Tenant-Id header and attaches it to request context."

**AI Output:**
```typescript
export const tenantContextPlugin: FastifyPluginCallback = (fastify, opts, done) => {
  fastify.addHook('preHandler', async (request, reply) => {
    const tenantId = request.headers['x-tenant-id'];
    const tenant = getTenant(tenantId);
    request.tenantContext = { tenant, requestId: randomUUID() };
  });
  done();
};
```

**My Refinement:**
- Added error handling for missing header
- Added TypeScript type augmentation for `request.tenantContext`
- Added logging

### AI Usage Assessment

**Efficiency gain:** ~40% faster than manual coding  
**Code quality:** High (after review and refinement)  
**Learning:** Helped me explore Fastify patterns I hadn't used before  
**Ownership:** 100% confident in the final code and architecture

---

## Conclusion

This platform demonstrates **production-quality multi-tenant architecture** with:

✅ Clean separation of concerns  
✅ Config-driven tenant behavior  
✅ Extensible design (easy to add tenants, verticals, providers)  
✅ Backwards-compatible evolution strategy  
✅ Type-safe end-to-end  
✅ Thoughtful API contracts (metadata, policies)  
✅ Distinct UX per tenant driven by backend config

**Ready for production** with clear paths for scaling, versioning, and feature rollout.

---

**Author:** Ron Chistik  
**Date:** December 2025  
**Assignment:** Odynn Engineering Take-Home

