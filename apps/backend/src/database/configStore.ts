/**
 * Config Store - SQLite queries for page configs and themes
 * 
 * Simple, synchronous, no ORM.
 */

import { getDb } from './db.js';

// ============================================================================
// Types
// ============================================================================

export interface PageConfig {
  tenant_id: string;
  page_id: string;
  serialized_state: string;
  created_at: string;
  updated_at: string;
}

export interface TenantTheme {
  tenant_id: string;
  theme_overrides: string;
  updated_at: string;
}

// ============================================================================
// Page Configs
// ============================================================================

/**
 * Get page config
 */
export function getPageConfig(
  tenantId: string, 
  pageId: string
): PageConfig | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT * FROM page_configs 
    WHERE tenant_id = ? AND page_id = ?
  `).get(tenantId, pageId) as PageConfig | undefined;
  
  return row || null;
}

/**
 * Get all page configs for a tenant
 */
export function getPageConfigsForTenant(
  tenantId: string
): PageConfig[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM page_configs WHERE tenant_id = ?
  `).all(tenantId) as PageConfig[];
}

/**
 * Save page config (upsert)
 */
export function savePageConfig(
  tenantId: string,
  pageId: string,
  serializedState: Record<string, unknown>
): PageConfig {
  const db = getDb();
  const now = new Date().toISOString();
  const stateJson = JSON.stringify(serializedState);
  
  db.prepare(`
    INSERT INTO page_configs (tenant_id, page_id, serialized_state, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT (tenant_id, page_id) 
    DO UPDATE SET 
      serialized_state = excluded.serialized_state,
      updated_at = excluded.updated_at
  `).run(tenantId, pageId, stateJson, now, now);
  
  return {
    tenant_id: tenantId,
    page_id: pageId,
    serialized_state: stateJson,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Delete page config
 */
export function deletePageConfig(
  tenantId: string, 
  pageId: string
): boolean {
  const db = getDb();
  const result = db.prepare(`
    DELETE FROM page_configs 
    WHERE tenant_id = ? AND page_id = ?
  `).run(tenantId, pageId);
  
  return result.changes > 0;
}

// ============================================================================
// Tenant Themes
// ============================================================================

/**
 * Get tenant theme
 */
export function getTenantTheme(
  tenantId: string
): TenantTheme | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT * FROM tenant_themes WHERE tenant_id = ?
  `).get(tenantId) as TenantTheme | undefined;
  
  return row || null;
}

/**
 * Save tenant theme (upsert)
 */
export function saveTenantTheme(
  tenantId: string,
  themeOverrides: Record<string, unknown>
): TenantTheme {
  const db = getDb();
  const now = new Date().toISOString();
  const themeJson = JSON.stringify(themeOverrides);
  
  db.prepare(`
    INSERT INTO tenant_themes (tenant_id, theme_overrides, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT (tenant_id) 
    DO UPDATE SET 
      theme_overrides = excluded.theme_overrides,
      updated_at = excluded.updated_at
  `).run(tenantId, themeJson, now);
  
  return {
    tenant_id: tenantId,
    theme_overrides: themeJson,
    updated_at: now,
  };
}

/**
 * Delete tenant theme
 */
export function deleteTenantTheme(
  tenantId: string
): boolean {
  const db = getDb();
  const result = db.prepare(`
    DELETE FROM tenant_themes WHERE tenant_id = ?
  `).run(tenantId);
  
  return result.changes > 0;
}

// ============================================================================
// Reset Operations
// ============================================================================

/**
 * Reset all configs for a tenant
 */
export function resetTenant(tenantId: string): void {
  const db = getDb();
  db.prepare(`DELETE FROM page_configs WHERE tenant_id = ?`).run(tenantId);
  db.prepare(`DELETE FROM tenant_themes WHERE tenant_id = ?`).run(tenantId);
}

/**
 * Reset everything
 */
export function resetAll(): void {
  const db = getDb();
  db.prepare(`DELETE FROM page_configs`).run();
  db.prepare(`DELETE FROM tenant_themes`).run();
}

// ============================================================================
// Error Logs
// ============================================================================

export interface ErrorLog {
  id: number;
  tenant_id: string | null;
  request_id: string | null;
  error_code: string;
  error_message: string;
  http_status: number | null;
  request_method: string | null;
  request_path: string | null;
  request_body: string | null;
  stack_trace: string | null;
  created_at: string;
}

export interface LogErrorParams {
  tenantId?: string;
  requestId?: string;
  errorCode: string;
  errorMessage: string;
  httpStatus?: number;
  requestMethod?: string;
  requestPath?: string;
  requestBody?: unknown;
  stackTrace?: string;
}

/**
 * Log an error to the database
 */
export function logError(params: LogErrorParams): ErrorLog {
  const db = getDb();
  const now = new Date().toISOString();
  
  const result = db.prepare(`
    INSERT INTO error_logs (
      tenant_id, request_id, error_code, error_message, 
      http_status, request_method, request_path, request_body, 
      stack_trace, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    params.tenantId || null,
    params.requestId || null,
    params.errorCode,
    params.errorMessage,
    params.httpStatus || null,
    params.requestMethod || null,
    params.requestPath || null,
    params.requestBody ? JSON.stringify(params.requestBody) : null,
    params.stackTrace || null,
    now
  );
  
  return {
    id: result.lastInsertRowid as number,
    tenant_id: params.tenantId || null,
    request_id: params.requestId || null,
    error_code: params.errorCode,
    error_message: params.errorMessage,
    http_status: params.httpStatus || null,
    request_method: params.requestMethod || null,
    request_path: params.requestPath || null,
    request_body: params.requestBody ? JSON.stringify(params.requestBody) : null,
    stack_trace: params.stackTrace || null,
    created_at: now,
  };
}

/**
 * Get recent errors for a tenant
 */
export function getErrorsForTenant(
  tenantId: string,
  limit = 50
): ErrorLog[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM error_logs 
    WHERE tenant_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(tenantId, limit) as ErrorLog[];
}

/**
 * Get all recent errors
 */
export function getRecentErrors(limit = 100): ErrorLog[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM error_logs 
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit) as ErrorLog[];
}
