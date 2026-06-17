// src/database/migrations.ts
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { logger } from '../utils/logger';

const CURRENT_SCHEMA_VERSION = 1;

export interface Migration {
  version: number;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

// Version 1 is the baseline schema created in Phase 1-4
const migrations: Migration[] = [
  {
    version: 1,
    up: async (db) => {
      // Version 1 Baseline
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY);
        INSERT OR IGNORE INTO schema_version (version) VALUES (0);

        CREATE TABLE IF NOT EXISTS collections (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS knowledge_items (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            source_url TEXT,
            description TEXT,
            ai_summary TEXT,
            short_summary TEXT,
            detailed_summary TEXT,
            ai_learnings TEXT,
            thumbnail TEXT,
            domain TEXT,
            processing_status TEXT DEFAULT 'completed',
            reason_saved TEXT,
            is_favorite INTEGER DEFAULT 0,
            collection_id TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS tags (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS item_tags (
            item_id TEXT,
            tag_id TEXT,
            PRIMARY KEY (item_id, tag_id),
            FOREIGN KEY (item_id) REFERENCES knowledge_items(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS search_history (
            id TEXT PRIMARY KEY,
            query TEXT NOT NULL,
            created_at INTEGER NOT NULL
        );
        
        -- Create Cleanup Trigger for Search History (Keeps max 10)
        CREATE TRIGGER IF NOT EXISTS cleanup_search_history
        AFTER INSERT ON search_history
        BEGIN
          DELETE FROM search_history 
          WHERE id NOT IN (
            SELECT id FROM search_history ORDER BY created_at DESC LIMIT 10
          );
        END;
      `);
    }
  }
];

export async function createDatabaseBackup(dbName: string): Promise<string | null> {
  try {
    const dbDir = `${FileSystem.documentDirectory}SQLite`;
    const dbPath = `${dbDir}/${dbName}`;
    const backupPath = `${dbDir}/${dbName}.backup-${Date.now()}`;
    
    const dbExists = await FileSystem.getInfoAsync(dbPath);
    if (!dbExists.exists) return null;

    await FileSystem.copyAsync({ from: dbPath, to: backupPath });
    logger.info('DATABASE', `Backup created: ${backupPath}`);
    return backupPath;
  } catch (error) {
    logger.error('DATABASE', 'Failed to create database backup', error);
    return null;
  }
}

export async function restoreDatabaseBackup(dbName: string, backupPath: string): Promise<boolean> {
  try {
    const dbDir = `${FileSystem.documentDirectory}SQLite`;
    const dbPath = `${dbDir}/${dbName}`;
    
    // Replace current DB with backup
    await FileSystem.copyAsync({ from: backupPath, to: dbPath });
    logger.info('DATABASE', `Database restored from backup: ${backupPath}`);
    return true;
  } catch (error) {
    logger.error('DATABASE', 'Failed to restore backup', error);
    return false;
  }
}

export async function runMigrations(db: SQLite.SQLiteDatabase, dbName: string) {
  logger.info('DATABASE', 'Starting database initialization and migrations');

  // Enforce PRAGMAs required for data integrity
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  // Ensure schema_version table exists to bootstrap
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY);
    INSERT OR IGNORE INTO schema_version (version) VALUES (0);
  `);

  const result = await db.getFirstAsync<{version: number}>(`SELECT version FROM schema_version`);
  const userVersion = result?.version || 0;

  logger.info('DATABASE', `Current schema version: ${userVersion}`);

  if (userVersion >= CURRENT_SCHEMA_VERSION) {
    logger.info('DATABASE', 'Database is up to date.');
    return;
  }

  // Need to migrate. Backup first!
  const backupPath = await createDatabaseBackup(dbName);

  try {
    const sortedMigrations = migrations.sort((a, b) => a.version - b.version);
    
    for (const migration of sortedMigrations) {
      if (migration.version > userVersion && migration.version <= CURRENT_SCHEMA_VERSION) {
        logger.info('DATABASE', `Running migration to version ${migration.version}...`);
        
        // Execute inside a transaction if possible, or execute sequential promises
        await migration.up(db);
        
        // Update version
        await db.runAsync(`UPDATE schema_version SET version = ?`, [migration.version]);
        logger.info('DATABASE', `Successfully migrated to version ${migration.version}`);
      }
    }
    logger.info('DATABASE', 'All migrations completed successfully.');
  } catch (error) {
    logger.error('DATABASE', 'Migration failed, attempting to restore backup', error);
    if (backupPath) {
      await db.closeAsync();
      const restored = await restoreDatabaseBackup(dbName, backupPath);
      if (restored) {
        logger.info('DATABASE', 'Backup restored successfully after failed migration. App may need restart.');
      }
    }
    throw new Error('Database migration failed. Safe restore attempted.');
  }
}
