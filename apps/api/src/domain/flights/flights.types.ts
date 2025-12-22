/**
 * Domain types for flights
 * (Internal representation, may differ from provider types)
 */

export interface FlightSearchRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass?: string;
}

export interface FlightSearchResult {
  requestId: string;
  offers: FlightOffer[];
  metadata: {
    searchParams: FlightSearchRequest;
    appliedDefaults: {
      cabinClass: string;
      maxResults?: number;
    };
  };
}

export interface FlightOffer {
  id: string;
  owner: {
    code?: string;
    name: string;
  };
  price: {
    amount: string;
    currency: string;
  };
  slices: FlightSlice[];
  policy?: {
    compliant: boolean;
    violations: Array<{ type: string; message: string; severity: string }>;
    preferred?: boolean;
    promotions?: Array<{ type: string; message: string; value?: string | number }>;
  };
}

export interface FlightSlice {
  id: string;
  origin: {
    code: string;
    name: string;
    city?: string;
  };
  destination: {
    code: string;
    name: string;
    city?: string;
  };
  departureTime: string;
  arrivalTime: string;
  duration: string;
  segments: FlightSegment[];
}

export interface FlightSegment {
  id: string;
  origin: string;
  destination: string;
  departingAt: string;
  arrivingAt: string;
  duration: string;
  operatingCarrier: {
    code?: string;
    name: string;
  };
  marketingCarrier: {
    code?: string;
    name: string;
  };
  aircraft?: string;
}

