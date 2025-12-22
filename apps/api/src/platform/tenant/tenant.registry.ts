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
      // No restriction on stops (omit maxStops)
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
    primaryColor: '#10B981',
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
    designTokens: {
      colors: {
        background: '#ffffff',
        cardBackground: '#ffffff',
        textPrimary: '#1f2937',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        inputBackground: '#ffffff',
        inputBorder: '#d1d5db',
        error: '#dc2626',
        errorBackground: '#fee2e2',
        success: '#10b981',
      },
      typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        headingSize: '26px',
        headingWeight: 700,
        subheadingSize: '22px',
        subheadingWeight: 600,
        bodySize: '16px',
        bodyWeight: 400,
        labelSize: '15px',
        labelWeight: 600,
        priceSize: '48px',
        priceWeight: 800,
        buttonSize: '18px',
        buttonWeight: 700,
      },
      spacing: {
        cardPadding: '28px',
        cardGap: '24px',
        formPadding: '24px',
        formGap: '20px',
        inputPadding: '12px',
        buttonPadding: '16px 32px',
      },
      borders: {
        cardRadius: '20px',
        inputRadius: '8px',
        buttonRadius: '10px',
        cardBorderWidth: '2px',
      },
      shadows: {
        card: '0 2px 8px rgba(16, 185, 129, 0.1)',
        cardHover: '0 4px 12px rgba(16, 185, 129, 0.2)',
        form: '0 4px 12px rgba(16, 185, 129, 0.15)',
      },
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
    designTokens: {
      colors: {
        background: '#1a1a1a',
        cardBackground: '#2a2a2a',
        textPrimary: '#e5e5e5',
        textSecondary: '#a0a0a0',
        border: '#3a3a3a',
        inputBackground: '#1a1a1a',
        inputBorder: '#4a4a4a',
        error: '#ff6b6b',
        errorBackground: '#3a1a1a',
        success: '#10b981',
      },
      typography: {
        fontFamily: 'Georgia, "Times New Roman", serif',
        headingSize: '24px',
        headingWeight: 300,
        subheadingSize: '20px',
        subheadingWeight: 300,
        bodySize: '16px',
        bodyWeight: 300,
        labelSize: '14px',
        labelWeight: 400,
        priceSize: '32px',
        priceWeight: 300,
        buttonSize: '15px',
        buttonWeight: 500,
      },
      spacing: {
        cardPadding: '32px',
        cardGap: '32px',
        formPadding: '28px',
        formGap: '18px',
        inputPadding: '12px',
        buttonPadding: '14px 28px',
      },
      borders: {
        cardRadius: '12px',
        inputRadius: '6px',
        buttonRadius: '6px',
        cardBorderWidth: '1px',
      },
      shadows: {
        card: '0 8px 32px rgba(0,0,0,0.6)',
        cardHover: '0 12px 40px rgba(0,0,0,0.8)',
        form: '0 4px 20px rgba(0,0,0,0.5)',
      },
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
    designTokens: {
      colors: {
        background: '#f8f9fa',
        cardBackground: '#ffffff',
        textPrimary: '#1f2937',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        inputBackground: '#ffffff',
        inputBorder: '#d1d5db',
        error: '#dc2626',
        errorBackground: '#fee2e2',
        success: '#059669',
      },
      typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        headingSize: '20px',
        headingWeight: 600,
        subheadingSize: '16px',
        subheadingWeight: 600,
        bodySize: '14px',
        bodyWeight: 400,
        labelSize: '14px',
        labelWeight: 500,
        priceSize: '18px',
        priceWeight: 600,
        buttonSize: '14px',
        buttonWeight: 500,
      },
      spacing: {
        cardPadding: '16px',
        cardGap: '16px',
        formPadding: '20px',
        formGap: '14px',
        inputPadding: '8px 12px',
        buttonPadding: '10px 20px',
      },
      borders: {
        cardRadius: '8px',
        inputRadius: '6px',
        buttonRadius: '6px',
        cardBorderWidth: '0',
      },
      shadows: {
        card: '0 1px 3px rgba(0,0,0,0.1)',
        cardHover: '0 2px 6px rgba(0,0,0,0.15)',
        form: '0 1px 3px rgba(0,0,0,0.1)',
      },
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

