import * as SQLite from 'expo-sqlite';
import { KnowledgeItem } from '../types/schemas';

export async function insertKnowledgeItem(db: SQLite.SQLiteDatabase, item: KnowledgeItem) {
  try {
    await db.runAsync(
      `INSERT INTO knowledge_items (
        id, title, source_url, description, ai_summary, short_summary, detailed_summary, 
        ai_learnings, thumbnail, domain, processing_status, reason_saved, is_favorite, 
        collection_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.title,
        item.sourceUrl || null,
        item.description || null,
        item.aiSummary || null,
        item.shortSummary || null,
        item.detailedSummary || null,
        item.aiLearnings || null,
        item.thumbnail || null,
        item.domain || null,
        item.processingStatus || 'completed',
        item.reasonSaved || null,
        item.isFavorite ? 1 : 0,
        item.collectionId || null,
        item.createdAt,
        item.updatedAt
      ]
    );
  } catch (error) {
    console.error('Error inserting item:', error);
    throw error;
  }
}

export async function updateKnowledgeItemAIResult(
  db: SQLite.SQLiteDatabase, 
  id: string, 
  aiData: Partial<KnowledgeItem>,
  status: 'completed' | 'failed'
) {
  try {
    await db.runAsync(
      `UPDATE knowledge_items SET 
        ai_summary = ?,
        short_summary = ?,
        detailed_summary = ?,
        ai_learnings = ?,
        processing_status = ?,
        updated_at = ?
      WHERE id = ?`,
      [
        aiData.aiSummary || null,
        aiData.shortSummary || null,
        aiData.detailedSummary || null,
        aiData.aiLearnings || null,
        status,
        Date.now(),
        id
      ]
    );
  } catch (error) {
    console.error('Error updating AI result:', error);
    throw error;
  }
}

export async function checkDuplicate(db: SQLite.SQLiteDatabase, url?: string, title?: string): Promise<boolean> {
  if (!url && !title) return false;
  
  try {
    const result = await db.getFirstAsync<{count: number}>(
      `SELECT COUNT(*) as count FROM knowledge_items WHERE source_url = ? OR title = ?`,
      [url || '', title || '']
    );
    return (result?.count || 0) > 0;
  } catch (error) {
    console.error('Error checking duplicate:', error);
    return false;
  }
}
