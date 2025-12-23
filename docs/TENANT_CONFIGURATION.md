# Tenant Configuration Reference

This document provides a complete overview of all tenant configurations, including enabled verticals, defaults, and policies.

---

## 🎒 SaverTrips (`saver-trips`)

**Target Audience**: Students, budget travelers

### Enabled Verticals

| Vertical | Status |
|----------|--------|
| Flights  | ✅ Enabled |
| Stays    | ❌ Disabled |

### Flight Defaults

| Setting | Value |
|---------|-------|
| Cabin Class | `economy` (hardcoded) |
| Max Results | 20 |
| Sort Order | `price_asc` (cheapest first) |
| Max Stops | No restriction |

### Policies

| Type | Value | Message |
|------|-------|---------|
| `cabin_restriction` | `economy` | Only economy class available for students |
| `budget_airline_excluded` | `NK,F9,G4` (Spirit, Frontier, Allegiant) | Budget airlines excluded for safety/reliability standards |

### UX Configuration

| Setting | Value |
|---------|-------|
| Theme | Light |
| Primary Color | `#007fad` (teal blue) |
| Layout | Cards |
| Price Emphasis | High |
| Show Policy Compliance | Yes |
| Highlight Preferred | No |
| Show Promotions | No |
| Tagline | "Save up to 40% on your next flight ✈️" |

---

## 💎 Apex Reserve (`apex-reserve`)

**Target Audience**: High-end credit card concierge, wealthy clients

### Enabled Verticals

| Vertical | Status |
|----------|--------|
| Flights  | ✅ Enabled |
| Stays    | ✅ Enabled |

### Flight Defaults

| Setting | Value |
|---------|-------|
| Cabin Class | `business` |
| Max Results | 15 |
| Sort Order | `duration_asc` (fastest flights) |
| Max Stops | 1 (prefer direct or 1 stop) |

### Stay Defaults

| Setting | Value |
|---------|-------|
| Min Star Rating | 4 |
| Sort Order | `rating_desc` (best rated first) |
| Rooms | 1 |
| Guests | 2 |

### Policies

| Type | Value | Message |
|------|-------|---------|
| `star_rating_min` | `4` | Only 4+ star properties for Apex Reserve members |
| `cashback_promotion` | `DL,AA` (Delta, American) | Earn 5% cash back on Delta and American flights |

### UX Configuration

| Setting | Value |
|---------|-------|
| Theme | Dark |
| Primary Color | `#8B5CF6` (purple) |
| Layout | Cards |
| Price Emphasis | Low |
| Show Policy Compliance | No |
| Highlight Preferred | Yes |
| Show Promotions | Yes |
| Tagline | "Curated Luxury Travel" |
| Background Image | Luxury resort hero image |

---

## 🏢 Globex Systems (`globex-systems`)

**Target Audience**: Corporate employees, business travelers

### Enabled Verticals

| Vertical | Status |
|----------|--------|
| Flights  | ✅ Enabled |
| Stays    | ✅ Enabled |

### Flight Defaults

| Setting | Value |
|---------|-------|
| Cabin Class | `economy` |
| Max Results | 30 |
| Sort Order | `price_asc` |
| Preferred Airlines | `AA, UA, DL` (American, United, Delta) |

### Stay Defaults

| Setting | Value |
|---------|-------|
| Max Nightly Price | $250 USD |
| Sort Order | `price_asc` |
| Rooms | 1 |
| Guests | 1 |

### Policies

| Type | Value | Message |
|------|-------|---------|
| `preferred_airline` | `AA,UA,DL` | Company prefers American, United, or Delta |
| `price_cap` | `250` | Hotel stays must not exceed $250/night without approval |
| `role_based_cabin` | `business` | Business class requires executive approval (employees: economy only) |

### UX Configuration

| Setting | Value |
|---------|-------|
| Theme | Light |
| Primary Color | `#3B82F6` (blue) |
| Layout | Table (dense, efficient) |
| Price Emphasis | Medium |
| Show Policy Compliance | Yes |
| Highlight Preferred | Yes |
| Show Promotions | No |
| Tagline | "Corporate Travel Management" |

---

## Policy Types Reference

| Policy Type | Description | Example |
|-------------|-------------|---------|
| `cabin_restriction` | Restricts allowed cabin classes | Economy only |
| `budget_airline_excluded` | Excludes specific airlines | Spirit, Frontier, Allegiant |
| `star_rating_min` | Minimum hotel star rating | 4+ stars |
| `cashback_promotion` | Promotional cashback on specific airlines | 5% on Delta/American |
| `preferred_airline` | Flags preferred airlines (not enforced) | AA, UA, DL |
| `price_cap` | Maximum nightly hotel rate | $250/night |
| `role_based_cabin` | Cabin class restricted by user role | Executives can book business |

---

## Quick Reference for API Testing

### Swagger UI (`/docs`)

| Endpoint | Compatible Tenants |
|----------|-------------------|
| `POST /api/flights/search` | All: `saver-trips`, `apex-reserve`, `globex-systems` |
| `POST /api/stays/search` | Only: `apex-reserve`, `globex-systems` |
| `GET /api/config` | All tenants |

### Example Headers

```bash
# For flights (any tenant)
curl -H "X-Tenant-Id: saver-trips" ...

# For stays (must use tenant with stays enabled)
curl -H "X-Tenant-Id: globex-systems" ...
```

---

## Design Tokens

Each tenant has customizable design tokens for:

- **Colors**: Background, card, text, border, input, error, success
- **Typography**: Font family, sizes, weights for headings, body, labels, prices, buttons
- **Spacing**: Card padding, form padding, input padding, button padding, gaps
- **Borders**: Card radius, input radius, button radius, border widths
- **Shadows**: Card shadow, card hover shadow, form shadow

These tokens are returned via the `/api/config` endpoint and used by the frontend to render tenant-specific UI.

