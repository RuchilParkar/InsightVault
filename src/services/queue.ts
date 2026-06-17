// src/services/queue.ts
import { KnowledgeItem } from '../types/schemas';
import { processKnowledgeWithAI } from './ai';
import { updateKnowledgeItemAIResult } from '../database/queries';
import * as SQLite from 'expo-sqlite';
import { useKnowledgeStore } from '../store/useKnowledgeStore';
import { logger } from '../utils/logger';
import * as Crypto from 'expo-crypto';

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 2000;

async function linkTagsToItem(db: SQLite.SQLiteDatabase, itemId: string, tags: string[]) {
  for (const tagName of tags) {
    const cleanTag = tagName.trim().toLowerCase();
    if (!cleanTag) continue;

    try {
      // Create tag if not exists
      let tagId;
      const existingTag = await db.getFirstAsync<{id: string}>('SELECT id FROM tags WHERE name = ?', [cleanTag]);
      if (existingTag) {
        tagId = existingTag.id;
      } else {
        tagId = Crypto.randomUUID();
        await db.runAsync('INSERT INTO tags (id, name) VALUES (?, ?)', [tagId, cleanTag]);
        // Update store
        useKnowledgeStore.getState().setTags([...useKnowledgeStore.getState().tags, { id: tagId, name: cleanTag }]);
      }

      // Link to item
      await db.runAsync('INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)', [itemId, tagId]);
      
      // Update store item_tags
      const currentItemTags = useKnowledgeStore.getState().itemTags;
      if (!currentItemTags.some(it => it.itemId === itemId && it.tagId === tagId)) {
        useKnowledgeStore.getState().setItemTags([...currentItemTags, { itemId, tagId }]);
      }
    } catch (e) {
      logger.error('DATABASE', `Failed to link tag ${tagName} to item ${itemId}`, e);
    }
  }
}

async function linkCollectionToItem(db: SQLite.SQLiteDatabase, itemId: string, collectionName: string) {
  try {
    const existing = await db.getFirstAsync<{id: string}>('SELECT id FROM collections WHERE name = ?', [collectionName]);
    if (existing) {
      await db.runAsync('UPDATE knowledge_items SET collection_id = ? WHERE id = ?', [existing.id, itemId]);
      useKnowledgeStore.getState().updateItem(itemId, { collectionId: existing.id });
    }
  } catch (e) {
    logger.error('DATABASE', `Failed to link collection ${collectionName} to item ${itemId}`, e);
  }
}

export async function enqueueAIProcessing(
  db: SQLite.SQLiteDatabase,
  item: KnowledgeItem,
  retryCount: number = 0
) {
  setTimeout(async () => {
    try {
      logger.info('AI', `Processing item ${item.id} (Attempt ${retryCount + 1})`);
      const updateStore = useKnowledgeStore.getState().updateItem;
      updateStore(item.id, { processingStatus: 'processing' });
      
      const aiResult = await processKnowledgeWithAI(
        item.title,
        item.sourceUrl,
        item.description,
        item.reasonSaved
      );

      const updates: Partial<KnowledgeItem> = {
        shortSummary: aiResult.shortSummary,
        detailedSummary: aiResult.detailedSummary,
        aiSummary: aiResult.shortSummary, 
        aiLearnings: aiResult.learnings,
        processingStatus: 'completed',
        updatedAt: Date.now()
      };

      await updateKnowledgeItemAIResult(db, item.id, updates, 'completed');
      updateStore(item.id, updates);
      
      // Post-processing mapping
      if (aiResult.tags.length > 0) {
        await linkTagsToItem(db, item.id, aiResult.tags);
      }
      if (aiResult.suggestedCollection) {
        await linkCollectionToItem(db, item.id, aiResult.suggestedCollection);
      }

      logger.info('AI', `Successfully processed item ${item.id}`);

    } catch (error) {
      logger.warn('AI', `AI processing failed for item ${item.id}`, error);
      
      if (retryCount < MAX_RETRIES) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, retryCount);
        logger.info('AI', `Retrying item ${item.id} in ${backoff}ms...`);
        setTimeout(() => enqueueAIProcessing(db, item, retryCount + 1), backoff);
      } else {
        logger.error('AI', `Max retries reached for item ${item.id}. Marking as failed.`);
        const failUpdates: Partial<KnowledgeItem> = {
          processingStatus: 'failed',
          updatedAt: Date.now()
        };
        await updateKnowledgeItemAIResult(db, item.id, failUpdates, 'failed');
        useKnowledgeStore.getState().updateItem(item.id, failUpdates);
      }
    }
  }, 0);
}
