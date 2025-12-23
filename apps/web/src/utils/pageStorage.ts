/**
 * Page Storage Utilities
 * Save and load page configs from localStorage (temp solution until backend API)
 */

import type { PageConfig, ThemeOverrides } from '../api';

const STORAGE_KEY = 'odynn-page-configs';
const THEME_STORAGE_KEY = 'odynn-tenant-themes';

interface StoredPageConfigs {
  [tenantId: string]: {
    [pageId: string]: PageConfig;
  };
}

/**
 * Save page config to localStorage
 */
export function savePageConfig(
  tenantId: string,
  pageId: string,
  serializedState: string,
  themeOverrides?: ThemeOverrides
): void {
  const configs = getAllConfigs();
  
  if (!configs[tenantId]) {
    configs[tenantId] = {};
  }
  
  const pageConfig: PageConfig = {
    id: pageId,
    name: getPageName(pageId),
    serializedState,
  };
  
  if (themeOverrides) {
    pageConfig.themeOverrides = themeOverrides;
  }
  
  configs[tenantId][pageId] = pageConfig;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

/**
 * Load page config from localStorage
 */
export function loadPageConfig(
  tenantId: string,
  pageId: string
): PageConfig | null {
  const configs = getAllConfigs();
  return configs[tenantId]?.[pageId] || null;
}

/**
 * Get all stored configs
 */
function getAllConfigs(): StoredPageConfigs {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};
  
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

/**
 * Get page name from ID
 */
function getPageName(pageId: string): string {
  const names: Record<string, string> = {
    'flights-page': 'Flights Page',
    'stays-page': 'Stays Page',
  };
  return names[pageId] || pageId;
}

/**
 * Clear all stored configs (useful for reset)
 */
export function clearAllPageConfigs(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if a page config exists
 */
export function hasPageConfig(tenantId: string, pageId: string): boolean {
  const configs = getAllConfigs();
  return !!configs[tenantId]?.[pageId];
}

/**
 * Save tenant-level theme overrides (applies to ALL pages for this tenant)
 */
export function saveTenantTheme(tenantId: string, themeOverrides: ThemeOverrides): void {
  const themes = getAllTenantThemes();
  themes[tenantId] = themeOverrides;
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themes));
}

/**
 * Load tenant-level theme overrides
 */
export function loadTenantTheme(tenantId: string): ThemeOverrides | null {
  const themes = getAllTenantThemes();
  return themes[tenantId] || null;
}

/**
 * Get all tenant themes
 */
function getAllTenantThemes(): Record<string, ThemeOverrides> {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (!stored) return {};
  
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

/**
 * Clear all tenant themes
 */
export function clearAllTenantThemes(): void {
  localStorage.removeItem(THEME_STORAGE_KEY);
}

