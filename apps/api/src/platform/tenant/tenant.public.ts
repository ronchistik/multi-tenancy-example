/**
 * Convert tenant to public config (safe for frontend)
 */

import type { Tenant, PublicTenantConfig } from './tenant.types.js';

export function toPublicTenantConfig(tenant: Tenant): PublicTenantConfig {
  return {
    id: tenant.id,
    name: tenant.name,
    enabledVerticals: tenant.enabledVerticals,
    flightDefaults: tenant.flightDefaults,
    stayDefaults: tenant.stayDefaults,
    uxHints: tenant.uxHints,
  };
}

