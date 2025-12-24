/**
 * Page Storage Utilities
 * 
 * PostgreSQL via API - no localStorage fallback
 */

import type { PageConfig, ThemeOverrides } from '../api';

const API_BASE = 'http://localhost:5050/api';

// ============================================================================
// API Helpers
// ============================================================================

async function apiRequest<T>(
  method: string,
  path: string,
  tenantId: string,
  body?: unknown
): Promise<T | null> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': tenantId,
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE}${path}`, options);
  
  if (response.status === 404) {
    return null;
  }
  
  if (!response.ok) {
    throw new Error(`API ${method} ${path} failed: ${response.status}`);
  }
  
  return response.json();
}

// ============================================================================
// Page Configs
// ============================================================================

/**
 * Save page config to database
 */
export async function savePageConfig(
  tenantId: string,
  pageId: string,
  serializedState: string
): Promise<void> {
  await apiRequest('PUT', `/page-config/${pageId}`, tenantId, {
    serializedState: JSON.parse(serializedState),
  });
  console.log('✅ Page config saved to database');
}

/**
 * Load page config from database
 */
export async function loadPageConfig(
  tenantId: string,
  pageId: string
): Promise<PageConfig | null> {
  const result = await apiRequest<{
    tenantId: string;
    pageId: string;
    serializedState: Record<string, unknown>;
    updatedAt: string;
  }>('GET', `/page-config/${pageId}`, tenantId);
  
  if (!result) return null;
  
  return {
    id: result.pageId,
    name: getPageName(result.pageId),
    serializedState: JSON.stringify(result.serializedState),
  };
}

/**
 * Delete page config
 */
export async function deletePageConfig(
  tenantId: string,
  pageId: string
): Promise<void> {
  await apiRequest('DELETE', `/page-config/${pageId}`, tenantId);
}

// ============================================================================
// Tenant Themes
// ============================================================================

/**
 * Save tenant theme to database
 */
export async function saveTenantTheme(
  tenantId: string,
  themeOverrides: ThemeOverrides
): Promise<void> {
  await apiRequest('PUT', '/theme', tenantId, { themeOverrides });
  console.log('✅ Theme saved to database');
}

/**
 * Load tenant theme from database
 */
export async function loadTenantTheme(
  tenantId: string
): Promise<ThemeOverrides | null> {
  const result = await apiRequest<{
    tenantId: string;
    themeOverrides: ThemeOverrides;
    updatedAt: string;
  }>('GET', '/theme', tenantId);
  
  return result?.themeOverrides || null;
}

/**
 * Delete tenant theme
 */
export async function clearTenantTheme(tenantId: string): Promise<void> {
  await apiRequest('DELETE', '/theme', tenantId);
}

// ============================================================================
// Reset Operations
// ============================================================================

/**
 * Clear all configs for a tenant
 */
export async function clearPageConfigs(tenantId: string): Promise<void> {
  await apiRequest('POST', '/reset', tenantId);
}

/**
 * Clear all configs for ALL tenants
 */
export async function clearAllPageConfigs(): Promise<void> {
  await fetch(`${API_BASE}/reset-all`, { method: 'POST' });
}

/**
 * Clear all tenant themes (calls reset-all)
 */
export async function clearAllTenantThemes(): Promise<void> {
  // Already handled by clearAllPageConfigs
}

// ============================================================================
// Helpers
// ============================================================================

function getPageName(pageId: string): string {
  const names: Record<string, string> = {
    'flights-page': 'Flights Page',
    'stays-page': 'Stays Page',
  };
  return names[pageId] || pageId;
}

/**
 * Check if page config exists (async)
 */
export async function hasPageConfig(
  tenantId: string, 
  pageId: string
): Promise<boolean> {
  const config = await loadPageConfig(tenantId, pageId);
  return config !== null;
}
