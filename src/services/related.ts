import * as SQLite from 'expo-sqlite';
import { KnowledgeItem } from '../types/schemas';

export async function getRelatedKnowledge(
  db: SQLite.SQLiteDatabase,
  item: KnowledgeItem,
  limit: number = 5
): Promise<KnowledgeItem[]> {
  try {
    // We want to find items that share the same collection OR share the same tags.
    // For similar keywords, we could extract keywords from title, but tags and collections usually suffice for high relevance.
    
    // First, get the tag IDs for the current item
    const tagsResult = await db.getAllAsync<{tag_id: string}>(
      `SELECT tag_id FROM item_tags WHERE item_id = ?`,
      [item.id]
    );
    const tagIds = tagsResult.map(t => t.tag_id);
    
    const tagPlaceholders = tagIds.map(() => '?').join(',');
    
    let query = `
      SELECT k.*,
        (
          (CASE WHEN k.collection_id = ? THEN 50 ELSE 0 END) +
          (SELECT COUNT(*) FROM item_tags it2 WHERE it2.item_id = k.id AND it2.tag_id IN (${tagPlaceholders || "''"})) * 20
        ) as related_score
      FROM knowledge_items k
      WHERE k.id != ? AND related_score > 0
      ORDER BY related_score DESC, k.created_at DESC
      LIMIT ?
    `;

    const params: any[] = [
      item.collectionId || '',
      ...tagIds,
      item.id,
      limit
    ];

    const rawResults = await db.getAllAsync<any>(query, params);

    return rawResults.map(row => ({
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

  } catch (error) {
    console.error('Error fetching related knowledge:', error);
    return [];
  }
}
