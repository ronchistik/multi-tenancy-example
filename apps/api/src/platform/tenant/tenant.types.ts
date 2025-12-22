/**
 * Core tenant model
 * This defines the shape of a tenant and all configurable behaviors
 */

export type TenantId = 'saver-trips' | 'apex-reserve' | 'globex-systems';

export type Vertical = 'flights' | 'stays';

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export type SortOrder = 'price_asc' | 'price_desc' | 'duration_asc' | 'rating_desc';

/**
 * Flight-specific configuration
 */
export interface FlightDefaults {
  cabinClass: CabinClass;
  maxResults?: number;
  preferredAirlines?: string[]; // IATA codes
  excludedAirlines?: string[]; // IATA codes
  maxStops?: number;
  sortOrder: SortOrder;
}

/**
 * Stay (hotel) specific configuration
 */
export interface StayDefaults {
  minStarRating?: number;
  maxNightlyPrice?: number;
  currency?: string;
  sortOrder: SortOrder;
  roomsCount: number;
  guestsCount: number;
}

/**
 * Policy rules that can be applied
 */
export interface PolicyRule {
  type: 
    | 'preferred_airline' 
    | 'excluded_airline' 
    | 'price_cap' 
    | 'cabin_restriction' 
    | 'star_rating_min'
    | 'cashback_promotion'
    | 'budget_airline_excluded'
    | 'role_based_cabin';
  value: string | number;
  message?: string;
  metadata?: {
    cashbackPercent?: number;
    applicableAirlines?: string[];
    requiredRole?: string;
  };
}

/**
 * UX hints for frontend customization
 */
export interface UxHints {
  brandName: string;
  primaryColor: string;
  layout: 'cards' | 'table' | 'compact';
  showPolicyCompliance: boolean;
  highlightPreferred: boolean;
  priceEmphasis: 'high' | 'medium' | 'low';
  showPromotions?: boolean;
}

/**
 * User role for role-based policies (simulated for demo)
 */
export type UserRole = 'employee' | 'executive' | 'student';

/**
 * Complete tenant configuration
 */
export interface Tenant {
  id: TenantId;
  name: string;
  duffelApiKey: string;
  enabledVerticals: Vertical[];
  flightDefaults: FlightDefaults;
  stayDefaults: StayDefaults;
  policies: PolicyRule[];
  uxHints: UxHints;
  defaultUserRole?: UserRole;
}

/**
 * Public tenant config (safe to send to frontend)
 * Excludes sensitive data like API keys
 */
export interface PublicTenantConfig {
  id: TenantId;
  name: string;
  enabledVerticals: Vertical[];
  flightDefaults: FlightDefaults;
  stayDefaults: StayDefaults;
  uxHints: UxHints;
}

/**
 * Context object passed through the request lifecycle
 */
export interface TenantContext {
  tenant: Tenant;
  requestId: string;
}

