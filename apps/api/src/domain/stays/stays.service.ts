/**
 * Stays domain service
 * Orchestrates provider calls, applies tenant defaults and policies
 */

import { DuffelClient } from '../../providers/duffel/duffel.client.js';
import { DuffelStaysProvider } from '../../providers/duffel/duffel.stays.js';
import { evaluateStayPolicy } from '../../platform/policies/stays.policy.js';
import { getLocation } from '../../platform/locations/locations.js';
import type { TenantContext } from '../../platform/tenant/tenant.types.js';
import type { StaySearchRequest, StaySearchResult, StayOffer } from './stays.types.js';
import type { DuffelStay } from '../../providers/duffel/duffel.types.js';
import { compareMoney } from '../../shared/money.js';
import { ValidationError } from '../../shared/errors.js';

export class StaysService {
  async searchStays(
    request: StaySearchRequest,
    context: TenantContext,
  ): Promise<StaySearchResult> {
    const { tenant } = context;

    // Get location coordinates
    const location = getLocation(request.locationId);
    if (!location) {
      throw new ValidationError(`Invalid location ID: ${request.locationId}`);
    }

    // Create provider
    const client = new DuffelClient(tenant.duffelApiKey);
    const provider = new DuffelStaysProvider(client);

    // Search
    const response = await provider.searchStays({
      latitude: location.latitude,
      longitude: location.longitude,
      radiusKm: location.radiusKm,
      checkInDate: request.checkInDate,
      checkOutDate: request.checkOutDate,
      guests: request.guests,
      rooms: request.rooms,
    });

    // Handle response - ensure data is an array
    const staysData = Array.isArray(response.data) ? response.data : [];
    
    // Map and enrich with policies
    let stays = staysData.map((stay) =>
      this.mapStay(stay, tenant, context),
    );

    // Filter by minimum star rating
    if (tenant.stayDefaults.minStarRating) {
      stays = stays.filter(
        (stay) =>
          !stay.accommodation.rating ||
          stay.accommodation.rating >= tenant.stayDefaults.minStarRating!,
      );
    }

    // Apply tenant-specific sorting
    stays = this.sortStays(stays, tenant.stayDefaults.sortOrder);

    return {
      stays,
      metadata: {
        searchParams: request,
        location: {
          id: location.id,
          name: location.name,
        },
        appliedDefaults: {
          minStarRating: tenant.stayDefaults.minStarRating,
          maxNightlyPrice: tenant.stayDefaults.maxNightlyPrice,
        },
      },
    };
  }

  private mapStay(
    duffelStay: any,
    tenant: TenantContext['tenant'],
    context: TenantContext,
  ): StayOffer {
    // Duffel search results have accommodation property
    const accommodation = duffelStay.accommodation || {};
    const location = accommodation.location || {};
    
    // Build rate from cheapest_rate_* fields
    const rate = {
      id: duffelStay.id,
      price: {
        amount: duffelStay.cheapest_rate_total_amount || '0',
        currency: duffelStay.cheapest_rate_currency || 'USD',
      },
      roomName: 'Standard Room',
    };
    
    // Extract city from various possible locations in the response
    const cityName = location.address?.city_name 
      || location.city_name 
      || location.city 
      || accommodation.city
      || null;
    
    const addressLine = location.address?.line_one 
      || location.address 
      || null;
    
    const stayOffer: any = {
      id: duffelStay.id,
      accommodation: {
        id: accommodation.id || duffelStay.id,
        name: accommodation.name || 'Unknown',
        rating: accommodation.rating,
        location: cityName || addressLine ? {
          address: addressLine,
          city: cityName,
        } : undefined,
        photos: (accommodation.photos || []).map((p: any) => p.url),
      },
      rates: [rate],
    };
    
    // Evaluate policy
    const policyEval = evaluateStayPolicy(stayOffer, tenant);
    stayOffer.policy = policyEval;

    return stayOffer;
  }

  private sortStays(stays: StayOffer[], sortOrder: string): StayOffer[] {
    const sorted = [...stays];

    switch (sortOrder) {
      case 'price_asc':
        sorted.sort((a, b) => {
          const aPrice = a.rates[0]?.price.amount || '0';
          const bPrice = b.rates[0]?.price.amount || '0';
          return compareMoney(aPrice, bPrice);
        });
        break;
      case 'price_desc':
        sorted.sort((a, b) => {
          const aPrice = a.rates[0]?.price.amount || '0';
          const bPrice = b.rates[0]?.price.amount || '0';
          return compareMoney(bPrice, aPrice);
        });
        break;
      case 'rating_desc':
        sorted.sort((a, b) => {
          const aRating = a.accommodation.rating || 0;
          const bRating = b.accommodation.rating || 0;
          return bRating - aRating;
        });
        break;
    }

    return sorted;
  }
}

