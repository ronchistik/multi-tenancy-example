/**
 * Domain types for stays (hotels)
 */

export interface StaySearchRequest {
  locationId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  rooms: number;
}

export interface StaySearchResult {
  stays: StayOffer[];
  metadata: {
    searchParams: StaySearchRequest;
    location: {
      id: string;
      name: string;
    };
    appliedDefaults: {
      minStarRating?: number;
      maxNightlyPrice?: number;
    };
  };
}

export interface StayOffer {
  id: string;
  accommodation: {
    id: string;
    name: string;
    rating?: number;
    location?: {
      address?: string;
      city?: string;
    };
    photos?: string[];
  };
  rates: StayRate[];
  policy?: {
    compliant: boolean;
    violations: Array<{ type: string; message: string; severity: string }>;
  };
}

export interface StayRate {
  id: string;
  price: {
    amount: string;
    currency: string;
  };
  availableRooms?: number;
  roomName?: string;
}

