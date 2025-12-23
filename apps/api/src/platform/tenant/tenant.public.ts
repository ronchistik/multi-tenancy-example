/**
 * Convert tenant to public config (safe for frontend)
 */

import type { Tenant, PublicTenantConfig } from './tenant.types.js';

export function toPublicTenantConfig(tenant: Tenant): PublicTenantConfig {
  const config: PublicTenantConfig = {
    id: tenant.id,
    name: tenant.name,
    enabledVerticals: tenant.enabledVerticals,
    flightDefaults: tenant.flightDefaults,
    stayDefaults: tenant.stayDefaults,
    uxHints: tenant.uxHints, // This includes designTokens
  };
  
  if (tenant.pages) {
    config.pages = tenant.pages;
  }
  
  return config;
}

