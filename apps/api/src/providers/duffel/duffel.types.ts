/**
 * Duffel API types (subset for this assignment)
 */

// Flights

export interface DuffelOfferRequest {
  cabin_class?: string;
  passengers: Array<{ type: 'adult' | 'child' | 'infant' }>;
  slices: Array<{
    origin: string;
    destination: string;
    departure_date: string;
  }>;
  max_connections?: number;
  return_offers?: boolean;
}

export interface DuffelOfferRequestResponse {
  data: {
    id: string;
    offers: DuffelOffer[];
  };
}

export interface DuffelOffer {
  id: string;
  owner: {
    iata_code?: string;
    name: string;
  };
  total_amount: string;
  total_currency: string;
  total_emissions_kg?: string;
  slices: DuffelSlice[];
}

export interface DuffelSlice {
  id: string;
  origin: {
    iata_code: string;
    name: string;
    city_name?: string;
  };
  destination: {
    iata_code: string;
    name: string;
    city_name?: string;
  };
  departure_time: string;
  arrival_time: string;
  duration: string;
  segments: DuffelSegment[];
}

export interface DuffelSegment {
  id: string;
  origin: {
    iata_code: string;
  };
  destination: {
    iata_code: string;
  };
  departing_at: string;
  arriving_at: string;
  duration: string;
  operating_carrier: {
    iata_code?: string;
    name: string;
  };
  marketing_carrier: {
    iata_code?: string;
    name: string;
  };
  aircraft?: {
    name?: string;
  };
}

// Stays

export interface DuffelStaySearchRequest {
  location: {
    geographic_coordinates: {
      latitude: number;
      longitude: number;
    };
    radius: number;
  };
  check_in_date: string;
  check_out_date: string;
  guests: Array<{
    type: 'adult';
  }>;
  rooms: number;
}

export interface DuffelStaySearchResponse {
  data: DuffelStay[];
}

export interface DuffelStay {
  id: string;
  accommodation: {
    id: string;
    name: string;
    rating?: number;
    location?: {
      address?: string;
      city?: string;
    };
    photos?: Array<{ url: string }>;
  };
  rates: DuffelRate[];
}

export interface DuffelRate {
  id: string;
  total_amount: string;
  total_currency: string;
  available_rooms?: number;
  room_name?: string;
}

