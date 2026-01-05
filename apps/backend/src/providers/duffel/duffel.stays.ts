/**
 * Duffel Stays adapter
 * Maps domain stay requests to Duffel API
 */

import { DuffelClient } from './duffel.client.js';
import type { DuffelStaySearchResponse } from './duffel.types.js';

export interface StaySearchParams {
  latitude: number;
  longitude: number;
  radiusKm: number;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  rooms: number;
}

export class DuffelStaysProvider {
  constructor(private readonly client: DuffelClient) {}

  async searchStays(params: StaySearchParams): Promise<DuffelStaySearchResponse> {
    // Duffel Stays: guests is array of objects, rooms is a number
    const request: any = {
      location: {
        geographic_coordinates: {
          latitude: params.latitude,
          longitude: params.longitude,
        },
        radius: params.radiusKm,
      },
      check_in_date: params.checkInDate,
      check_out_date: params.checkOutDate,
      guests: Array(params.guests).fill(null).map(() => ({ type: 'adult' })),
      rooms: params.rooms,
    };

    const response = await this.client.post<any, any>(
      '/stays/search',
      request,
    );
    
    // Duffel Stays returns { data: { results: [...] } }
    const stays = response?.data?.results || [];
    
    return { data: stays };
  }
}

