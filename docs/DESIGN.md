# Design Document

## 1. Architecture Overview

```
Frontend (React) ──HTTP──▶ API (Fastify) ──▶ Domain Services ──▶ Providers (Duffel)
                              │                    │
                              ▼                    ▼
                          Database            Platform Layer
                          (SQLite)          (Tenants, Policies)
```

**Layers:**
- **API Layer:** Tenant resolution, request validation, Swagger docs
- **Domain Layer:** FlightsService, StaysService — applies tenant defaults and policies
- **Platform Layer:** Tenant registry, policy engine, location data
- **Provider Layer:** Duffel adapters (flights, stays) — maps external API to domain models
- **Database:** SQLite for page configs and theme overrides

---

## 2. Tenant Modeling

### How Tenants Are Modeled

Tenants are defined as TypeScript objects in `tenant.registry.ts`:

```typescript
interface Tenant {
  id: TenantId;
  name: string;
  duffelApiKey: string;              // Provider credentials
  enabledVerticals: Vertical[];      // ['flights', 'stays']
  
  flightDefaults: {
    cabinClass: CabinClass;          // economy, business, first
    maxResults?: number;
    preferredAirlines?: string[];    // IATA codes
    excludedAirlines?: string[];
    maxStops?: number;
    sortOrder: SortOrder;
  };
  
  stayDefaults: {
    minStarRating?: number;
    maxNightlyPrice?: number;
    currency?: string;
    sortOrder: SortOrder;
    roomsCount: number;
    guestsCount: number;
  };
  
  policies: PolicyRule[];            // Business rules (see Policy Engine)
  
  uxHints: {
    brandName: string;
    primaryColor: string;
    layout: 'cards' | 'table' | 'compact';
    theme: 'light' | 'dark';
    showPolicyCompliance: boolean;
    highlightPreferred: boolean;
    priceEmphasis: 'high' | 'medium' | 'low';
    tagline?: string;
    backgroundImage?: string;        // Hero image URL
    featureCards?: FeatureCard[];    // Trivago-style cards
    buttonLabels?: ButtonLabels;
    designTokens: DesignTokens;      // Colors, typography, spacing, borders, shadows
  };
  
  defaultUserRole?: UserRole;        // For role-based policies
  pages?: {                          // Visual editor page configs
    flights?: PageConfig;
    stays?: PageConfig;
  };
}
```

### Policy Rules

```typescript
interface PolicyRule {
  type: 'preferred_airline' | 'excluded_airline' | 'price_cap' | 
        'cabin_restriction' | 'star_rating_min' | 'cashback_promotion' |
        'budget_airline_excluded' | 'role_based_cabin';
  value: string | number;
  message?: string;
  metadata?: {
    cashbackPercent?: number;
    applicableAirlines?: string[];
    requiredRole?: string;
  };
}
```

### Design Tokens

Each tenant has a complete design system:

```typescript
interface DesignTokens {
  colors: { background, cardBackground, textPrimary, textSecondary, border, ... };
  typography: { fontFamily, headingSize, headingWeight, bodySize, priceSize, ... };
  spacing: { cardPadding, cardGap, formPadding, inputPadding, buttonPadding };
  borders: { cardRadius, inputRadius, buttonRadius, cardBorderWidth };
  shadows: { card, cardHover, form };
}
```

### Tenant Evolution Strategy

**Adding new attributes:**
- Add as optional (`newField?: string`) — existing tenants unaffected
- Frontend checks `if (config.newField) { ... }`

**Changing attribute types:**
- Add new field, deprecate old
- Support both during migration window
- Remove old field after all tenants migrated

**Adding new verticals (e.g., car rentals):**
- Add `'cars'` to `Vertical` type union
- Add `carDefaults?` (optional) to Tenant
- Existing tenants unchanged — they don't have `'cars'` in `enabledVerticals`

### Backwards Compatibility

- All new tenant config fields are **optional**
- Config version field enables automated migrations
- API responses include metadata for graceful degradation

---

## 3. API Design

### Tenant Context Flow

```
Request ──▶ X-Tenant-Id header ──▶ tenantContextPlugin ──▶ getTenant(id)
                                           │
                                           ▼
                              request.tenantContext = { tenant, requestId }
                                           │
                                           ▼
                              Domain services receive context, apply:
                              - Search defaults
                              - Policy evaluation
                              - Provider credentials
```

### Why `X-Tenant-Id` Header?

| Approach | Pros | Cons |
|----------|------|------|
| Subdomain | Clean separation | Requires DNS, certs |
| Path prefix | Simple | Pollutes URLs |
| **Header** ✓ | Flexible, testable | Requires middleware |

Headers work with single domain, easy for curl testing, and support future JWT auth (embed tenant in token).

### Extending for New Tenants/Verticals

- **New tenant:** Add to `tenant.registry.ts` — no API changes
- **New vertical:** Add route, domain service, provider — existing routes unchanged
- **API versioning:** Path-based (`/api/v2/*`) when breaking changes needed

---

## 4. Provider Abstraction

### Current Design

Domain services call providers through interfaces:

```typescript
// Domain doesn't know about Duffel internals
const results = await duffelFlightsProvider.search(params);
return mapToDomainModel(results);
```

### Adding Another Provider (e.g., Amadeus)

1. Create `providers/amadeus/amadeus.flights.ts`
2. Implement same interface (`FlightSearchParams → FlightOffer[]`)
3. Configure provider per-tenant: `tenant.flightProvider: 'amadeus' | 'duffel'`
4. Domain service selects provider based on tenant config

**No changes to API layer or frontend.**

---

## 5. Frontend UX Strategy

### How Frontend "Knows" What to Render

The API returns a config object with `uxHints`:

```json
{
  "tenant": {
    "enabledVerticals": ["flights"],
    "uxHints": {
      "layout": "cards",
      "primaryColor": "#10B981",
      "priceEmphasis": "high"
    }
  }
}
```

Frontend interprets these:
- `enabledVerticals` → Show/hide vertical tabs
- `layout` → Choose `FlightCards` vs `FlightTable` component
- `priceEmphasis` → Size of price display
- `showPolicyCompliance` → Show/hide policy warnings

### Visual Page Editor

Users can customize layouts via Craft.js editor:
- Drag-and-drop components
- Theme color/font overrides
- Saved to SQLite per-tenant

---

## 6. Rollout & Versioning

**Feature rollout:**
1. Deploy code with feature flag in tenant config
2. Enable for 1 tenant (canary)
3. Monitor, then enable for all
4. Remove flag, make default

**API versioning:**
- Current: Single version (`/api/*`)
- Future: Path-based (`/api/v2/*`) with deprecation headers

**Database migrations:**
- Additive changes only (new columns with defaults)
- No breaking schema changes

**Horizontal scaling (Node.js):**
- Stateless API servers — no in-memory session state
- SQLite → PostgreSQL for multi-instance (shared DB)
- Load balancer distributes requests across instances
- Tenant context resolved per-request (no sticky sessions needed)

**Capacity estimates:**

| Configuration | Requests/sec | Concurrent Users |
|--------------|--------------|------------------|
| Current (1 process) | ~16 req/s | ~100-200 |
| + Clustering (4 cores) | ~64 req/s | ~400-800 |
| + Redis cache | ~500 req/s | ~5,000-10,000 |
| + 4 instances + LB | ~2,000 req/s | ~50,000-100,000 |

**Bottlenecks & solutions:**
- Single process → Add clustering (PM2 or Node cluster module)
- No caching → Add Redis (5-min TTL for searches)
- No rate limiting → Add per-tenant rate limits
- Duffel latency → Parallel searches, connection pooling

---

## 7. Testing Strategy

**What we test:**
- Policy evaluation (preferred airlines, price caps, cabin restrictions)
- Tenant registry (correct configs for all 3 tenants)
- API endpoints (search with tenant defaults, error handling)

**Run tests:** `pnpm test`

**Coverage targets:**
- Platform layer (policies, tenants): 90%+
- Domain layer (services): 80%+
- API routes: 70%+

---

## 8. Future Enhancements

With more time:
- **Tenant admin UI** — Self-service config updates
- **Dynamic policies** — Expression-based rules, time-based caps
- **Redis caching** — 5-min TTL for search results, 90%+ cache hit rate for popular routes
- **Rate limiting** — Per-tenant request limits to protect API and Duffel quota
- **Circuit breakers** — Graceful degradation when Duffel is down
- **Background job queue** — SQS/Bull for heavy searches, async processing
- **CDN** — CloudFront/Fastly for static assets
- **Auto-scaling** — Scale instances based on load (AWS ASG, K8s HPA)
- **Observability & Analytics** — Per-tenant dashboards (search volume, conversion). Prometheus, Posthog, or similar
- **Error tracking** — Centralized logging (Sentry, Datadog) by tenant and request ID
- **Performance audits** — Lighthouse, Pagespeed

---

## 9. AI Tool Usage

**Tool:** Claude (via Cursor)
