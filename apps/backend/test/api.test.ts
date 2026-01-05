/**
 * API Integration Tests
 * Tests for tenant-aware API endpoints and error handling
 */

import { describe, it, expect } from 'vitest';
import { getTenant, getAllTenants } from '../src/platform/tenant/tenant.registry';
import { FlightsService } from '../src/domain/flights/flights.service';
import { StaysService } from '../src/domain/stays/stays.service';
import type { TenantContext } from '../src/platform/tenant/tenant.types';

// ============================================
// TENANT REGISTRY TESTS
// ============================================

describe('Tenant Registry', () => {
  it('should have exactly 3 tenants configured', () => {
    const tenants = getAllTenants();
    expect(tenants).toHaveLength(3);
  });

  it('should return all expected tenant IDs', () => {
    const tenants = getAllTenants();
    const ids = tenants.map(t => t.id);
    
    expect(ids).toContain('saver-trips');
    expect(ids).toContain('apex-reserve');
    expect(ids).toContain('globex-systems');
  });

  it('should return undefined for unknown tenant', () => {
    const tenant = getTenant('unknown-tenant' as any);
    expect(tenant).toBeUndefined();
  });

  it('should return correct tenant by ID', () => {
    const tenant = getTenant('saver-trips');
    
    expect(tenant).toBeDefined();
    expect(tenant?.id).toBe('saver-trips');
    expect(tenant?.name).toBe('SaverTrips');
  });
});

// ============================================
// TENANT CONFIGURATION TESTS
// ============================================

describe('Tenant Configurations', () => {
  describe('SaverTrips (Budget App)', () => {
    const tenant = getTenant('saver-trips');

    it('should exist', () => {
      expect(tenant).toBeDefined();
    });

    it('should have only flights enabled (hotels disabled)', () => {
      expect(tenant?.enabledVerticals).toContain('flights');
      expect(tenant?.enabledVerticals).not.toContain('stays');
    });

    it('should default to economy cabin class', () => {
      expect(tenant?.flightDefaults.cabinClass).toBe('economy');
    });

    it('should sort by price ascending', () => {
      expect(tenant?.flightDefaults.sortOrder).toBe('price_asc');
    });

    it('should use cards layout', () => {
      expect(tenant?.uxHints.layout).toBe('cards');
    });

    it('should have high price emphasis', () => {
      expect(tenant?.uxHints.priceEmphasis).toBe('high');
    });
  });

  describe('Apex Reserve (Premium Portal)', () => {
    const tenant = getTenant('apex-reserve');

    it('should exist', () => {
      expect(tenant).toBeDefined();
    });

    it('should have both flights and stays enabled', () => {
      expect(tenant?.enabledVerticals).toContain('flights');
      expect(tenant?.enabledVerticals).toContain('stays');
    });

    it('should default to business cabin class', () => {
      expect(tenant?.flightDefaults.cabinClass).toBe('business');
    });

    it('should have minimum 4-star hotel rating', () => {
      expect(tenant?.stayDefaults?.minStarRating).toBe(4);
    });

    it('should have cashback promotion policy', () => {
      const cashbackPolicy = tenant?.policies.find(p => p.type === 'cashback_promotion');
      expect(cashbackPolicy).toBeDefined();
      expect(cashbackPolicy?.metadata?.cashbackPercent).toBe(5);
    });
  });

  describe('Globex Systems (Corporate Tool)', () => {
    const tenant = getTenant('globex-systems');

    it('should exist', () => {
      expect(tenant).toBeDefined();
    });

    it('should have both flights and stays enabled', () => {
      expect(tenant?.enabledVerticals).toContain('flights');
      expect(tenant?.enabledVerticals).toContain('stays');
    });

    it('should have preferred airlines configured', () => {
      expect(tenant?.flightDefaults.preferredAirlines).toBeDefined();
      expect(tenant?.flightDefaults.preferredAirlines).toContain('AA');
      expect(tenant?.flightDefaults.preferredAirlines).toContain('UA');
      expect(tenant?.flightDefaults.preferredAirlines).toContain('DL');
    });

    it('should have price cap policy', () => {
      const priceCap = tenant?.policies.find(p => p.type === 'price_cap');
      expect(priceCap).toBeDefined();
      expect(priceCap?.value).toBe(250);
    });

    it('should use table layout', () => {
      expect(tenant?.uxHints.layout).toBe('table');
    });

    it('should show policy compliance warnings', () => {
      expect(tenant?.uxHints.showPolicyCompliance).toBe(true);
    });

    it('should have role-based cabin restrictions', () => {
      const rolePolicy = tenant?.policies.find(p => p.type === 'role_based_cabin');
      expect(rolePolicy).toBeDefined();
      expect(rolePolicy?.metadata?.requiredRole).toBe('executive');
    });
  });
});

// ============================================
// VERTICAL ENABLEMENT TESTS
// ============================================

describe('Vertical Enablement', () => {
  it('SaverTrips should not allow stays search', () => {
    const tenant = getTenant('saver-trips');
    const staysEnabled = tenant?.enabledVerticals.includes('stays');
    
    expect(staysEnabled).toBe(false);
  });

  it('Apex Reserve should allow stays search', () => {
    const tenant = getTenant('apex-reserve');
    const staysEnabled = tenant?.enabledVerticals.includes('stays');
    
    expect(staysEnabled).toBe(true);
  });

  it('all tenants should have flights enabled', () => {
    const tenants = getAllTenants();
    
    tenants.forEach(tenant => {
      expect(tenant.enabledVerticals).toContain('flights');
    });
  });
});

// ============================================
// UX HINTS VALIDATION TESTS
// ============================================

describe('UX Hints Validation', () => {
  it('all tenants should have required UX hints', () => {
    const tenants = getAllTenants();
    
    tenants.forEach(tenant => {
      expect(tenant.uxHints.brandName).toBeDefined();
      expect(tenant.uxHints.primaryColor).toBeDefined();
      expect(tenant.uxHints.layout).toBeDefined();
      expect(['cards', 'table']).toContain(tenant.uxHints.layout);
    });
  });

  it('all tenants should have valid hex color for primaryColor', () => {
    const tenants = getAllTenants();
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    
    tenants.forEach(tenant => {
      expect(tenant.uxHints.primaryColor).toMatch(hexColorRegex);
    });
  });

  it('tenants should have distinct primary colors', () => {
    const tenants = getAllTenants();
    const colors = tenants.map(t => t.uxHints.primaryColor);
    const uniqueColors = new Set(colors);
    
    expect(uniqueColors.size).toBe(tenants.length);
  });
});

// ============================================
// POLICY CONFIGURATION TESTS
// ============================================

describe('Policy Configurations', () => {
  it('all policies should have required fields', () => {
    const tenants = getAllTenants();
    
    tenants.forEach(tenant => {
      tenant.policies.forEach(policy => {
        expect(policy.type).toBeDefined();
        expect(policy.message).toBeDefined();
      });
    });
  });

  it('policy types should be valid', () => {
    const validTypes = [
      'preferred_airline',
      'price_cap',
      'star_rating_min',
      'budget_airline_excluded',
      'role_based_cabin',
      'cashback_promotion',
      'cabin_restriction',
    ];
    
    const tenants = getAllTenants();
    
    tenants.forEach(tenant => {
      tenant.policies.forEach(policy => {
        expect(validTypes).toContain(policy.type);
      });
    });
  });
});

// ============================================
// SEARCH DEFAULTS TESTS
// ============================================

describe('Search Defaults', () => {
  it('all tenants should have valid cabin class default', () => {
    const validCabins = ['economy', 'premium_economy', 'business', 'first'];
    const tenants = getAllTenants();
    
    tenants.forEach(tenant => {
      expect(validCabins).toContain(tenant.flightDefaults.cabinClass);
    });
  });

  it('all tenants should have valid sort order', () => {
    const validSortOrders = ['price_asc', 'price_desc', 'duration_asc', 'rating_desc'];
    const tenants = getAllTenants();
    
    tenants.forEach(tenant => {
      expect(validSortOrders).toContain(tenant.flightDefaults.sortOrder);
    });
  });

  it('tenants with stays enabled should have stay defaults', () => {
    const tenants = getAllTenants();
    
    tenants
      .filter(t => t.enabledVerticals.includes('stays'))
      .forEach(tenant => {
        expect(tenant.stayDefaults).toBeDefined();
        expect(tenant.stayDefaults?.sortOrder).toBeDefined();
      });
  });
});

// ============================================
// DUFFEL API KEY TESTS
// ============================================

describe('Duffel API Keys', () => {
  it('all tenants should have Duffel API key configured', () => {
    const tenants = getAllTenants();
    
    tenants.forEach(tenant => {
      expect(tenant.duffelApiKey).toBeDefined();
      expect(tenant.duffelApiKey.length).toBeGreaterThan(0);
    });
  });

  it('each tenant should have unique Duffel API key', () => {
    const tenants = getAllTenants();
    const keys = tenants.map(t => t.duffelApiKey);
    const uniqueKeys = new Set(keys);
    
    // Keys should be unique (one per tenant)
    expect(uniqueKeys.size).toBe(tenants.length);
  });
});

// ============================================
// DOMAIN SERVICE CONTEXT TESTS
// ============================================

describe('Domain Services', () => {
  describe('FlightsService', () => {
    it('should be instantiable', () => {
      const service = new FlightsService();
      expect(service).toBeDefined();
    });

    it('should have searchFlights method', () => {
      const service = new FlightsService();
      expect(typeof service.searchFlights).toBe('function');
    });
  });

  describe('StaysService', () => {
    it('should be instantiable', () => {
      const service = new StaysService();
      expect(service).toBeDefined();
    });

    it('should have searchStays method', () => {
      const service = new StaysService();
      expect(typeof service.searchStays).toBe('function');
    });
  });
});

// ============================================
// TENANT CONTEXT CREATION TESTS
// ============================================

describe('Tenant Context', () => {
  it('should be creatable with valid tenant', () => {
    const tenant = getTenant('saver-trips');
    
    const context: TenantContext = {
      tenant: tenant!,
      requestId: 'test-request-123',
    };

    expect(context.tenant.id).toBe('saver-trips');
    expect(context.requestId).toBe('test-request-123');
  });

  it('context should carry tenant defaults', () => {
    const tenant = getTenant('apex-reserve');
    
    const context: TenantContext = {
      tenant: tenant!,
      requestId: 'test-request-456',
    };

    expect(context.tenant.flightDefaults.cabinClass).toBe('business');
    expect(context.tenant.stayDefaults?.minStarRating).toBe(4);
  });
});

