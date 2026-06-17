// src/services/backup.ts
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { z } from 'zod';
import { KnowledgeItemSchema, CollectionSchema, TagSchema, SearchHistorySchema } from '../types/schemas';
import { logger } from '../utils/logger';

export const EXPORT_VERSION = 1;

export const BackupSchema = z.object({
  exportVersion: z.number().min(1),
  createdAt: z.number(),
  data: z.object({
    collections: z.array(CollectionSchema),
    tags: z.array(TagSchema),
    knowledge_items: z.array(KnowledgeItemSchema),
    item_tags: z.array(z.object({
      item_id: z.string().uuid(),
      tag_id: z.string().uuid()
    })),
    search_history: z.array(SearchHistorySchema)
  })
});

export type BackupData = z.infer<typeof BackupSchema>;

export async function exportDatabaseToJSON(db: SQLite.SQLiteDatabase): Promise<string | null> {
  try {
    logger.info('BACKUP', 'Starting database export...');
    const collections = await db.getAllAsync('SELECT * FROM collections');
    const tags = await db.getAllAsync('SELECT * FROM tags');
    const knowledge_items = await db.getAllAsync('SELECT * FROM knowledge_items');
    const item_tags = await db.getAllAsync('SELECT * FROM item_tags');
    const search_history = await db.getAllAsync('SELECT * FROM search_history');

    // Transform snake_case back to camelCase for the schema if needed, but since our Zod schema expects camelCase for knowledge_items, we need to map it.
    const mappedItems = knowledge_items.map((row: any) => ({
      id: row.id,
      title: row.title,
      sourceUrl: row.source_url || undefined,
      description: row.description || undefined,
      aiSummary: row.ai_summary || undefined,
      shortSummary: row.short_summary || undefined,
      detailedSummary: row.detailed_summary || undefined,
      aiLearnings: row.ai_learnings || undefined,
      thumbnail: row.thumbnail || undefined,
      domain: row.domain || undefined,
      processingStatus: row.processing_status,
      reasonSaved: row.reason_saved || undefined,
      isFavorite: row.is_favorite === 1,
      collectionId: row.collection_id || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    // Re-map collections if schema requires camelCase
    const mappedCollections = collections.map((row: any) => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at
    }));

    const mappedHistory = search_history.map((row: any) => ({
      id: row.id,
      query: row.query,
      createdAt: row.created_at
    }));

    const payload: BackupData = {
      exportVersion: EXPORT_VERSION,
      createdAt: Date.now(),
      data: {
        collections: mappedCollections as any,
        tags: tags as any,
        knowledge_items: mappedItems as any,
        item_tags: item_tags as any,
        search_history: mappedHistory as any
      }
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const uri = `${FileSystem.documentDirectory}InsightVault_Backup_${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(uri, jsonString);
    
    logger.info('BACKUP', `Export successful. Saved to ${uri}`);
    return uri;
  } catch (error) {
    logger.error('BACKUP', 'Export failed', error);
    return null;
  }
}

export async function importDatabaseFromJSON(db: SQLite.SQLiteDatabase, uri: string): Promise<boolean> {
  try {
    logger.info('BACKUP', 'Starting database import validation...');
    const jsonString = await FileSystem.readAsStringAsync(uri);
    const parsed = JSON.parse(jsonString);
    
    // Validate with Zod
    const result = BackupSchema.safeParse(parsed);
    
    if (!result.success) {
      logger.error('BACKUP', 'Import validation failed', result.error);
      return false;
    }

    const backup = result.data;
    logger.info('BACKUP', 'Validation successful. Dropping and replacing tables...');

    // Execute in transaction
    await db.withTransactionAsync(async () => {
      // Clear existing
      await db.execAsync(`
        DELETE FROM item_tags;
        DELETE FROM tags;
        DELETE FROM knowledge_items;
        DELETE FROM collections;
        DELETE FROM search_history;
      `);

      // Insert Collections
      for (const col of backup.data.collections) {
        await db.runAsync('INSERT INTO collections (id, name, created_at) VALUES (?, ?, ?)', [col.id, col.name, col.createdAt]);
      }

      // Insert Tags
      for (const tag of backup.data.tags) {
        await db.runAsync('INSERT INTO tags (id, name) VALUES (?, ?)', [tag.id, tag.name]);
      }

      // Insert Knowledge Items
      for (const item of backup.data.knowledge_items) {
        await db.runAsync(
          `INSERT INTO knowledge_items (
            id, title, source_url, description, ai_summary, short_summary, detailed_summary, 
            ai_learnings, thumbnail, domain, processing_status, reason_saved, is_favorite, 
            collection_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id, item.title, item.sourceUrl || null, item.description || null, item.aiSummary || null,
            item.shortSummary || null, item.detailedSummary || null, item.aiLearnings || null,
            item.thumbnail || null, item.domain || null, item.processingStatus, item.reasonSaved || null,
            item.isFavorite ? 1 : 0, item.collectionId || null, item.createdAt, item.updatedAt
          ]
        );
      }

      // Insert Item Tags
      for (const it of backup.data.item_tags) {
        await db.runAsync('INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)', [it.item_id, it.tag_id]);
      }

      // Insert History
      for (const hist of backup.data.search_history) {
        await db.runAsync('INSERT INTO search_history (id, query, created_at) VALUES (?, ?, ?)', [hist.id, hist.query, hist.createdAt]);
      }
    });

    logger.info('BACKUP', 'Import successful. App requires restart to hydrate store.');
    return true;
  } catch (error) {
    logger.error('BACKUP', 'Import failed', error);
    return false;
  }
}
