/**
 * Duffel Flights adapter
 * Maps domain flight requests to Duffel API
 */

import { DuffelClient } from './duffel.client.js';
import type { DuffelOfferRequest, DuffelOfferRequestResponse } from './duffel.types.js';

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass?: string;
  maxConnections?: number;
}

export class DuffelFlightsProvider {
  constructor(private readonly client: DuffelClient) {}

  async searchFlights(params: FlightSearchParams): Promise<DuffelOfferRequestResponse> {
    const slices: DuffelOfferRequest['slices'] = [
      {
        origin: params.origin,
        destination: params.destination,
        departure_date: params.departureDate,
      },
    ];

    // Add return slice if round-trip
    if (params.returnDate) {
      slices.push({
        origin: params.destination,
        destination: params.origin,
        departure_date: params.returnDate,
      });
    }

    const request: DuffelOfferRequest = {
      cabin_class: params.cabinClass,
      passengers: Array(params.passengers).fill({ type: 'adult' }),
      slices,
      max_connections: params.maxConnections,
      return_offers: true,
    };

    return this.client.post<DuffelOfferRequest, DuffelOfferRequestResponse>(
      '/air/offer_requests',
      request,
    );
  }
}

