/**
 * SQLite Database Connection
 * 
 * Zero-config, file-based database.
 * Auto-creates data/configs.db on first run.
 */

import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get project root (apps/api)
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', '..', 'data');
const DB_PATH = join(DATA_DIR, 'configs.db');

let db: Database.Database | null = null;

/**
 * Get database instance (lazy init)
 */
export function getDb(): Database.Database {
  if (db) return db;
  
  // Ensure data directory exists
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL'); // Better performance
  
  console.log(`✅ SQLite database: ${DB_PATH}`);
  return db;
}

/**
 * Close database
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Initialize database schema
 */
export function initSchema(): void {
  const database = getDb();
  
  database.exec(`
    -- Page configurations table
    CREATE TABLE IF NOT EXISTS page_configs (
      tenant_id TEXT NOT NULL,
      page_id TEXT NOT NULL,
      serialized_state TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (tenant_id, page_id)
    );
    
    -- Tenant theme overrides table  
    CREATE TABLE IF NOT EXISTS tenant_themes (
      tenant_id TEXT PRIMARY KEY,
      theme_overrides TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
  
  console.log('✅ Database schema initialized');
}

/**
 * Health check
 */
export function checkHealth(): boolean {
  try {
    const database = getDb();
    database.prepare('SELECT 1').get();
    return true;
  } catch {
    return false;
  }
}
