/**
 * Tenant Registry
 * Single source of truth for all tenant configurations
 */

import { env } from '../../shared/env.js';
import type { Tenant, TenantId } from './tenant.types.js';

/**
 * Tenant 1: SaverTrips
 * Student-focused app where price is everything
 * - Hotels disabled
 * - Economy only
 * - Playful card interface
 */
const SAVER_TRIPS: Tenant = {
  id: 'saver-trips',
  name: 'SaverTrips',
  duffelApiKey: env.DUFFEL_KEY_SAVER_TRIPS,
  enabledVerticals: ['flights'], // Hotels disabled
  flightDefaults: {
    cabinClass: 'economy', // Hardcoded to economy
    maxResults: 20,
    sortOrder: 'price_asc', // Always cheapest first
    maxStops: undefined, // No restriction on stops
  },
  stayDefaults: {
    sortOrder: 'price_asc',
    roomsCount: 1,
    guestsCount: 1,
  },
  policies: [
    {
      type: 'cabin_restriction',
      value: 'economy',
      message: 'Only economy class available for students',
    },
    {
      type: 'budget_airline_excluded',
      value: 'NK,F9,G4', // Spirit, Frontier, Allegiant
      message: 'Budget airlines excluded for safety/reliability standards',
    },
  ],
  uxHints: {
    brandName: 'SaverTrips',
    primaryColor: '#10B981', // Green
    layout: 'cards',
    showPolicyCompliance: true,
    highlightPreferred: false,
    priceEmphasis: 'high',
    showPromotions: false,
    theme: 'light',
    tagline: 'Budget-Friendly Student Travel',
    buttonLabels: {
      searchFlights: 'Find Cheapest Flights',
      selectFlight: 'Book Now',
    },
  },
  defaultUserRole: 'student',
};

/**
 * Tenant 2: Apex Reserve
 * High-end credit card concierge for wealthy clients
 * - Both flights and hotels enabled
 * - Business class default
 * - Luxury aesthetic, dark mode
 */
const APEX_RESERVE: Tenant = {
  id: 'apex-reserve',
  name: 'Apex Reserve',
  duffelApiKey: env.DUFFEL_KEY_APEX_RESERVE,
  enabledVerticals: ['flights', 'stays'],
  flightDefaults: {
    cabinClass: 'business', // Default to business class
    maxResults: 15,
    sortOrder: 'duration_asc', // Fastest flights
    maxStops: 1, // Prefer direct or max 1 stop
  },
  stayDefaults: {
    minStarRating: 4, // 4+ star hotels only
    sortOrder: 'rating_desc', // Best rated first
    roomsCount: 1,
    guestsCount: 2,
  },
  policies: [
    {
      type: 'star_rating_min',
      value: 4,
      message: 'Only 4+ star properties for Apex Reserve members',
    },
    {
      type: 'cashback_promotion',
      value: 'DL,AA', // Delta and American
      message: 'Earn 5% cash back on Delta and American flights',
      metadata: {
        cashbackPercent: 5,
        applicableAirlines: ['DL', 'AA'],
      },
    },
  ],
  uxHints: {
    brandName: 'Apex Reserve',
    primaryColor: '#8B5CF6',
    layout: 'cards',
    showPolicyCompliance: false,
    highlightPreferred: true,
    priceEmphasis: 'low',
    showPromotions: true,
    theme: 'dark',
    tagline: 'Curated Luxury Travel',
    buttonLabels: {
      searchFlights: 'Search Flights',
      selectFlight: 'Reserve',
      selectStay: 'Reserve',
    },
  },
  defaultUserRole: 'executive',
};

/**
 * Tenant 3: Globex Systems
 * Corporate travel tool for business employees
 * - Strict policy enforcement
 * - Dense table layout for efficiency
 * - Preferred airlines flagged
 */
const GLOBEX_SYSTEMS: Tenant = {
  id: 'globex-systems',
  name: 'Globex Systems',
  duffelApiKey: env.DUFFEL_KEY_GLOBEX_SYSTEMS,
  enabledVerticals: ['flights', 'stays'],
  flightDefaults: {
    cabinClass: 'economy', // Default to economy
    maxResults: 30,
    preferredAirlines: ['AA', 'UA', 'DL'], // American, United, Delta
    sortOrder: 'price_asc',
  },
  stayDefaults: {
    maxNightlyPrice: 250,
    currency: 'USD',
    sortOrder: 'price_asc',
    roomsCount: 1,
    guestsCount: 1,
  },
  policies: [
    {
      type: 'preferred_airline',
      value: 'AA,UA,DL',
      message: 'Company prefers American, United, or Delta',
    },
    {
      type: 'price_cap',
      value: 250,
      message: 'Hotel stays must not exceed $250/night without approval',
    },
    {
      type: 'role_based_cabin',
      value: 'business',
      message: 'Business class requires executive approval (employees: economy only)',
      metadata: {
        requiredRole: 'executive',
      },
    },
  ],
  uxHints: {
    brandName: 'Globex Travel',
    primaryColor: '#3B82F6',
    layout: 'table',
    showPolicyCompliance: true,
    highlightPreferred: true,
    priceEmphasis: 'medium',
    showPromotions: false,
    theme: 'light',
    tagline: 'Corporate Travel Management',
    buttonLabels: {
      searchFlights: 'Search',
      selectFlight: 'Book',
      selectStay: 'Book',
    },
  },
  defaultUserRole: 'employee', // Most users are employees
};

/**
 * Tenant registry (in-memory)
 */
const TENANT_REGISTRY = new Map<TenantId, Tenant>([
  [SAVER_TRIPS.id, SAVER_TRIPS],
  [APEX_RESERVE.id, APEX_RESERVE],
  [GLOBEX_SYSTEMS.id, GLOBEX_SYSTEMS],
]);

/**
 * Get tenant by ID
 */
export function getTenant(tenantId: TenantId): Tenant | undefined {
  return TENANT_REGISTRY.get(tenantId);
}

/**
 * Get all tenants
 */
export function getAllTenants(): Tenant[] {
  return Array.from(TENANT_REGISTRY.values());
}

/**
 * Check if tenant has vertical enabled
 */
export function isTenantVerticalEnabled(tenant: Tenant, vertical: string): boolean {
  return tenant.enabledVerticals.includes(vertical as any);
}

