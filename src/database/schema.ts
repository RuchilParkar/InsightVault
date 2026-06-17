// src/database/schema.ts
import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';
import { logger } from '../utils/logger';
import { ensureDefaultCollections } from './collections';

export const DB_NAME = 'insightvault.db';

export async function initDatabase(db: SQLite.SQLiteDatabase) {
  try {
    logger.info('DATABASE', 'Initiating database boot sequence...');
    
    // The migration runner handles the PRAGMAS and table creation logic sequentially
    await runMigrations(db, DB_NAME);
    
    // Ensure default collections are seeded after schema is ready
    await ensureDefaultCollections(db);
    
    logger.info('DATABASE', 'Database initialization complete.');
  } catch (error) {
    logger.error('DATABASE', 'Critical error initializing database', error);
    throw error;
  }
}
