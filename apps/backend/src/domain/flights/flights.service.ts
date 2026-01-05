/**
 * Flights domain service
 * Orchestrates provider calls, applies tenant defaults and policies
 */

import { DuffelClient } from '../../providers/duffel/duffel.client.js';
import { DuffelFlightsProvider } from '../../providers/duffel/duffel.flights.js';
import { evaluateFlightPolicy } from '../../platform/policies/flights.policy.js';
import type { TenantContext } from '../../platform/tenant/tenant.types.js';
import type { FlightSearchRequest, FlightSearchResult, FlightOffer } from './flights.types.js';
import type { DuffelOffer } from '../../providers/duffel/duffel.types.js';
import { compareMoney } from '../../shared/money.js';

export class FlightsService {
  async searchFlights(
    request: FlightSearchRequest,
    context: TenantContext,
  ): Promise<FlightSearchResult> {
    const { tenant } = context;

    // Apply tenant defaults
    const cabinClass = request.cabinClass || tenant.flightDefaults.cabinClass;
    const maxConnections = tenant.flightDefaults.maxStops;

    // Create provider
    const client = new DuffelClient(tenant.duffelApiKey);
    const provider = new DuffelFlightsProvider(client);

    // Search
    const response = await provider.searchFlights({
      ...request,
      cabinClass,
      maxConnections,
    });

    // Map and enrich with policies
    let offers = response.data.offers.map((offer) =>
      this.mapOffer(offer, tenant, context),
    );

    // Apply tenant-specific sorting
    offers = this.sortOffers(offers, tenant.flightDefaults.sortOrder);

    // Apply max results limit
    if (tenant.flightDefaults.maxResults) {
      offers = offers.slice(0, tenant.flightDefaults.maxResults);
    }

    return {
      requestId: response.data.id,
      offers,
      metadata: {
        searchParams: request,
        appliedDefaults: {
          cabinClass,
          maxResults: tenant.flightDefaults.maxResults,
        },
      },
    };
  }

  private mapOffer(
    duffelOffer: DuffelOffer,
    tenant: TenantContext['tenant'],
    _context: TenantContext,
  ): FlightOffer {
    // Evaluate policy
    const policyEval = evaluateFlightPolicy(duffelOffer as any, tenant);

    return {
      id: duffelOffer.id,
      owner: {
        code: duffelOffer.owner.iata_code,
        name: duffelOffer.owner.name,
      },
      price: {
        amount: duffelOffer.total_amount,
        currency: duffelOffer.total_currency,
      },
      slices: duffelOffer.slices.map((slice) => {
        // Get departure from first segment, arrival from last segment
        const firstSegment = slice.segments[0];
        const lastSegment = slice.segments[slice.segments.length - 1];
        
        return {
        id: slice.id,
        origin: {
          code: slice.origin.iata_code,
          name: slice.origin.name,
          city: slice.origin.city_name,
        },
        destination: {
          code: slice.destination.iata_code,
          name: slice.destination.name,
          city: slice.destination.city_name,
        },
          departureTime: firstSegment?.departing_at || slice.departure_time,
          arrivalTime: lastSegment?.arriving_at || slice.arrival_time,
        duration: slice.duration,
        segments: slice.segments.map((seg) => ({
          id: seg.id,
          origin: seg.origin.iata_code,
          destination: seg.destination.iata_code,
          departingAt: seg.departing_at,
          arrivingAt: seg.arriving_at,
          duration: seg.duration,
          operatingCarrier: {
            code: seg.operating_carrier.iata_code,
            name: seg.operating_carrier.name,
          },
          marketingCarrier: {
            code: seg.marketing_carrier.iata_code,
            name: seg.marketing_carrier.name,
          },
          aircraft: seg.aircraft?.name,
        })),
        };
      }),
      policy: policyEval,
    };
  }

  private sortOffers(offers: FlightOffer[], sortOrder: string): FlightOffer[] {
    const sorted = [...offers];

    switch (sortOrder) {
      case 'price_asc':
        sorted.sort((a, b) => compareMoney(a.price.amount, b.price.amount));
        break;
      case 'price_desc':
        sorted.sort((a, b) => compareMoney(b.price.amount, a.price.amount));
        break;
      case 'duration_asc':
        sorted.sort((a, b) => {
          const aDuration = this.parseDuration(a.slices[0]?.duration || 'PT0H');
          const bDuration = this.parseDuration(b.slices[0]?.duration || 'PT0H');
          return aDuration - bDuration;
        });
        break;
    }

    return sorted;
  }

  private parseDuration(isoDuration: string): number {
    // Simple ISO 8601 duration parser (PT1H30M -> 90 minutes)
    const hours = /(\d+)H/.exec(isoDuration);
    const minutes = /(\d+)M/.exec(isoDuration);
    return (hours ? parseInt(hours[1], 10) : 0) * 60 + (minutes ? parseInt(minutes[1], 10) : 0);
  }
}

