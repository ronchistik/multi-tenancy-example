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
 * Design system tokens for page builder
 */
export interface DesignTokens {
  colors: {
    background: string;
    cardBackground: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    inputBackground: string;
    inputBorder: string;
    error: string;
    errorBackground: string;
    success: string;
  };
  typography: {
    fontFamily: string;
    headingSize: string;
    headingWeight: number;
    subheadingSize: string;
    subheadingWeight: number;
    bodySize: string;
    bodyWeight: number;
    labelSize: string;
    labelWeight: number;
    priceSize: string;
    priceWeight: number;
    buttonSize: string;
    buttonWeight: number;
  };
  spacing: {
    cardPadding: string;
    cardGap: string;
    formPadding: string;
    formGap: string;
    inputPadding: string;
    buttonPadding: string;
  };
  borders: {
    cardRadius: string;
    inputRadius: string;
    buttonRadius: string;
    cardBorderWidth: string;
  };
  shadows: {
    card: string;
    cardHover: string;
    form: string;
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
  theme: 'light' | 'dark';
  tagline?: string;
  buttonLabels?: {
    searchFlights?: string;
    searchStays?: string;
    selectFlight?: string;
    selectStay?: string;
  };
  designTokens: DesignTokens; // REQUIRED - must always be present
}

/**
 * User role for role-based policies (simulated for demo)
 */
export type UserRole = 'employee' | 'executive' | 'student';

/**
 * Theme overrides for page-level customization
 */
export interface ThemeOverrides {
  primaryColor?: string;
  colors?: Partial<{
    background: string;
    cardBackground: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    inputBackground: string;
    inputBorder: string;
    error: string;
    errorBackground: string;
    success: string;
  }>;
  typography?: Partial<{
    fontFamily: string;
    headingSize: string;
    headingWeight: number;
    subheadingSize: string;
    subheadingWeight: number;
    bodySize: string;
    bodyWeight: number;
    labelSize: string;
    labelWeight: number;
    priceSize: string;
    priceWeight: number;
    buttonSize: string;
    buttonWeight: number;
  }>;
  spacing?: Partial<{
    cardPadding: string;
    cardGap: string;
    formPadding: string;
    formGap: string;
    inputPadding: string;
    buttonPadding: string;
  }>;
  borders?: Partial<{
    cardRadius: string;
    inputRadius: string;
    buttonRadius: string;
    cardBorderWidth: string;
  }>;
  shadows?: Partial<{
    card: string;
    cardHover: string;
    form: string;
  }>;
}

/**
 * Page configuration for dynamic page rendering
 */
export interface PageConfig {
  id: string;
  name: string;
  serializedState: string; // Craft.js serialized JSON
  themeOverrides?: ThemeOverrides; // Optional theme customizations
}

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
  pages?: {
    flights?: PageConfig;
    stays?: PageConfig;
  };
}

/**
 * Public tenant config (safe to send to frontend)
 * Excludes sensitive data like API keys
 * Includes full UxHints with designTokens
 */
export interface PublicTenantConfig {
  id: TenantId;
  name: string;
  enabledVerticals: Vertical[];
  flightDefaults: FlightDefaults;
  stayDefaults: StayDefaults;
  uxHints: UxHints; // Includes designTokens
  pages?: {
    flights?: PageConfig;
    stays?: PageConfig;
  };
}

/**
 * Context object passed through the request lifecycle
 */
export interface TenantContext {
  tenant: Tenant;
  requestId: string;
}

