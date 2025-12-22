/**
 * API client
 */

export interface TenantConfig {
  id: string;
  name: string;
  enabledVerticals: string[];
  flightDefaults: {
    cabinClass: string;
    maxResults?: number;
    sortOrder: string;
  };
  stayDefaults: {
    minStarRating?: number;
    maxNightlyPrice?: number;
    sortOrder: string;
  };
  uxHints: {
    brandName: string;
    primaryColor: string;
    layout: 'cards' | 'table' | 'compact';
    showPolicyCompliance: boolean;
    highlightPreferred: boolean;
    priceEmphasis: 'high' | 'medium' | 'low';
  };
}

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface ConfigResponse {
  tenant: TenantConfig;
  locations: Location[];
}

export interface FlightSearchRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass?: string;
}

export interface FlightOffer {
  id: string;
  owner: { code?: string; name: string };
  price: { amount: string; currency: string };
  slices: Array<{
    origin: { code: string; name: string };
    destination: { code: string; name: string };
    departureTime: string;
    arrivalTime: string;
    duration: string;
  }>;
  policy?: {
    compliant: boolean;
    violations: Array<{ type: string; message: string; severity: string }>;
    preferred?: boolean;
    promotions?: Array<{ type: string; message: string; value?: string | number }>;
  };
}

export interface FlightSearchResult {
  offers: FlightOffer[];
  metadata: any;
}

export interface StaySearchRequest {
  locationId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  rooms: number;
}

export interface StayOffer {
  id: string;
  accommodation: {
    name: string;
    rating?: number;
    location?: { address?: string; city?: string };
    photos?: string[];
  };
  rates: Array<{
    id: string;
    price: { amount: string; currency: string };
    roomName?: string;
  }>;
  policy?: {
    compliant: boolean;
    violations: Array<{ type: string; message: string; severity: string }>;
  };
}

export interface StaySearchResult {
  stays: StayOffer[];
  metadata: any;
}

class ApiClient {
  constructor(private tenantId: string) {}

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': this.tenantId,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getConfig(): Promise<ConfigResponse> {
    return this.fetch<ConfigResponse>('/config');
  }

  async searchFlights(request: FlightSearchRequest): Promise<FlightSearchResult> {
    return this.fetch<FlightSearchResult>('/flights/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async searchStays(request: StaySearchRequest): Promise<StaySearchResult> {
    return this.fetch<StaySearchResult>('/stays/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export function createApiClient(tenantId: string): ApiClient {
  return new ApiClient(tenantId);
}

