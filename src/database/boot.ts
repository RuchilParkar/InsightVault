// src/database/boot.ts
import * as SQLite from 'expo-sqlite';
import { useKnowledgeStore } from '../store/useKnowledgeStore';
import { KnowledgeItem, Collection, Tag } from '../types/schemas';
import { logger } from '../utils/logger';

export async function hydrateStore(db: SQLite.SQLiteDatabase) {
  try {
    logger.info('APP', 'Hydrating store from local database...');
    
    // Fetch collections
    const collections = await db.getAllAsync<Collection>('SELECT * FROM collections ORDER BY created_at ASC');
    useKnowledgeStore.getState().setCollections(collections);

    // Fetch knowledge items
    const rawItems = await db.getAllAsync<any>('SELECT * FROM knowledge_items ORDER BY created_at DESC');
    const items: KnowledgeItem[] = rawItems.map(row => ({
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
    
    useKnowledgeStore.getState().setItems(items);
    
    // Fetch tags
    const tags = await db.getAllAsync<Tag>('SELECT * FROM tags');
    useKnowledgeStore.getState().setTags(tags);

    // Fetch item_tags
    const itemTags = await db.getAllAsync<{item_id: string, tag_id: string}>('SELECT * FROM item_tags');
    const mappedItemTags = itemTags.map(it => ({ itemId: it.item_id, tagId: it.tag_id }));
    useKnowledgeStore.getState().setItemTags(mappedItemTags);

    logger.info('APP', `Hydration complete: ${items.length} items, ${collections.length} collections, ${tags.length} tags.`);
  } catch (error) {
    logger.error('APP', 'Failed to hydrate store', error);
  }
}
