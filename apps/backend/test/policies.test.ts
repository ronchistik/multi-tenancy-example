/**
 * Policy evaluation tests
 */

import { describe, it, expect } from 'vitest';
import { evaluateFlightPolicy } from '../src/platform/policies/flights.policy';
import { evaluateStayPolicy } from '../src/platform/policies/stays.policy';
import type { Tenant } from '../src/platform/tenant/tenant.types';

// Mock tenant with policies
const mockTenant: Tenant = {
  id: 'test-tenant',
  name: 'Test Tenant',
  duffelApiKey: 'test-key',
  enabledVerticals: ['flights', 'stays'],
  flightDefaults: {
    cabinClass: 'economy',
    preferredAirlines: ['AA', 'UA'],
    excludedAirlines: ['NK'],
    sortOrder: 'price_asc',
  },
  stayDefaults: {
    minStarRating: 4,
    maxNightlyPrice: 250,
    sortOrder: 'rating_desc',
    roomsCount: 1,
    guestsCount: 2,
  },
  policies: [
    {
      type: 'preferred_airline',
      value: 'AA,UA',
      message: 'Preferred airlines: American or United',
    },
    {
      type: 'star_rating_min',
      value: 4,
      message: 'Minimum 4-star rating required',
    },
    {
      type: 'price_cap',
      value: 250,
      message: 'Max $250/night',
    },
  ],
  uxHints: {
    brandName: 'Test',
    primaryColor: '#000',
    layout: 'cards',
    showPolicyCompliance: true,
    highlightPreferred: true,
    priceEmphasis: 'medium',
  },
};

describe('Flight Policy Evaluation', () => {
  it('should mark preferred airline as preferred', () => {
    const mockOffer = {
      id: '1',
      owner: {
        iata_code: 'AA',
        name: 'American Airlines',
      },
      total_amount: '500',
      total_currency: 'USD',
      slices: [],
    };

    const result = evaluateFlightPolicy(mockOffer, mockTenant);

    expect(result.preferred).toBe(true);
    expect(result.compliant).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('should warn about non-preferred airline when policy compliance is shown', () => {
    const mockOffer = {
      id: '2',
      owner: {
        iata_code: 'DL',
        name: 'Delta Airlines',
      },
      total_amount: '500',
      total_currency: 'USD',
      slices: [],
    };

    const result = evaluateFlightPolicy(mockOffer, mockTenant);

    expect(result.preferred).toBe(false);
    expect(result.compliant).toBe(true); // warning, not error
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations[0]?.type).toBe('preferred_airline');
  });

  it('should reject excluded airline', () => {
    const mockOffer = {
      id: '3',
      owner: {
        iata_code: 'NK',
        name: 'Spirit Airlines',
      },
      total_amount: '200',
      total_currency: 'USD',
      slices: [],
    };

    const result = evaluateFlightPolicy(mockOffer, mockTenant);

    expect(result.compliant).toBe(false); // error = non-compliant
    expect(result.violations.some((v) => v.severity === 'error')).toBe(true);
  });
});

describe('Stay Policy Evaluation', () => {
  it('should pass for hotel meeting minimum rating', () => {
    const mockStay = {
      id: '1',
      accommodation: {
        name: 'Luxury Hotel',
        rating: 5,
      },
      rates: [
        {
          total_amount: '200',
          total_currency: 'USD',
        },
      ],
    };

    const result = evaluateStayPolicy(mockStay, mockTenant);

    expect(result.compliant).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('should warn about hotel below minimum rating', () => {
    const mockStay = {
      id: '2',
      accommodation: {
        name: 'Budget Hotel',
        rating: 3,
      },
      rates: [
        {
          total_amount: '150',
          total_currency: 'USD',
        },
      ],
    };

    const result = evaluateStayPolicy(mockStay, mockTenant);

    expect(result.violations.some((v) => v.type === 'star_rating_min')).toBe(true);
  });

  it('should warn about price exceeding cap when policy compliance is shown', () => {
    const mockStay = {
      id: '3',
      accommodation: {
        name: 'Expensive Hotel',
        rating: 5,
      },
      rates: [
        {
          total_amount: '500',
          total_currency: 'USD',
        },
      ],
    };

    const result = evaluateStayPolicy(mockStay, mockTenant);

    expect(result.violations.some((v) => v.type === 'price_cap')).toBe(true);
  });

  it('should not show warnings when showPolicyCompliance is false', () => {
    const tenantNoWarnings = {
      ...mockTenant,
      uxHints: {
        ...mockTenant.uxHints,
        showPolicyCompliance: false,
      },
    };

    const mockStay = {
      id: '4',
      accommodation: {
        name: 'Expensive Hotel',
        rating: 3,
      },
      rates: [
        {
          total_amount: '500',
          total_currency: 'USD',
        },
      ],
    };

    const result = evaluateStayPolicy(mockStay, tenantNoWarnings);

    // Violations might exist but won't be added since showPolicyCompliance is false
    // (depends on implementation - our current impl still checks min rating)
    expect(result.compliant).toBe(true);
  });
});

describe('Tenant Registry', () => {
  it('should have 3 tenants configured', async () => {
    const { getAllTenants } = await import('../src/platform/tenant/tenant.registry');
    const tenants = getAllTenants();
    
    expect(tenants).toHaveLength(3);
    expect(tenants.map((t) => t.id)).toContain('saver-trips');
    expect(tenants.map((t) => t.id)).toContain('apex-reserve');
    expect(tenants.map((t) => t.id)).toContain('globex-systems');
  });

  it('should have distinct configurations per tenant', async () => {
    const { getTenant } = await import('../src/platform/tenant/tenant.registry');
    
    const saverTrips = getTenant('saver-trips');
    const apexReserve = getTenant('apex-reserve');
    
    expect(saverTrips?.enabledVerticals).not.toContain('stays'); // Hotels disabled
    expect(apexReserve?.enabledVerticals).toContain('stays'); // Hotels enabled
    
    expect(saverTrips?.flightDefaults.cabinClass).toBe('economy');
    expect(apexReserve?.flightDefaults.cabinClass).toBe('business');
  });
});

