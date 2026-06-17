import * as SQLite from 'expo-sqlite';
import { KnowledgeItem } from '../types/schemas';

export async function searchKnowledge(
  db: SQLite.SQLiteDatabase,
  query: string,
  filter?: string
): Promise<KnowledgeItem[]> {
  try {
    const safeQuery = `%${query}%`;
    let baseSql = `
      SELECT k.*, 
        (
          CASE 
            WHEN k.title LIKE ? THEN 100
            WHEN k.reason_saved LIKE ? THEN 80
            WHEN k.short_summary LIKE ? THEN 60
            WHEN k.description LIKE ? THEN 40
            WHEN k.detailed_summary LIKE ? THEN 30
            WHEN k.ai_learnings LIKE ? THEN 20
            ELSE 0 
          END
        ) as relevance_score
      FROM knowledge_items k
      LEFT JOIN item_tags it ON k.id = it.item_id
      LEFT JOIN tags t ON it.tag_id = t.id
      LEFT JOIN collections c ON k.collection_id = c.id
      WHERE (
        k.title LIKE ? OR 
        k.reason_saved LIKE ? OR 
        k.short_summary LIKE ? OR 
        k.description LIKE ? OR 
        k.detailed_summary LIKE ? OR 
        k.ai_learnings LIKE ? OR
        t.name LIKE ? OR
        c.name LIKE ?
      )
    `;

    const params: any[] = [
      safeQuery, safeQuery, safeQuery, safeQuery, safeQuery, safeQuery, // Score params
      safeQuery, safeQuery, safeQuery, safeQuery, safeQuery, safeQuery, safeQuery, safeQuery // Where params
    ];

    if (filter && filter !== 'All') {
      if (filter === 'Favorites') {
        baseSql += ` AND k.is_favorite = 1`;
      } else if (filter === 'Recently Added') {
        // No strict where, just sorting handled later, but we can enforce last 7 days or just order by
      } else {
        // Assume it's a collection name or tag
        baseSql += ` AND (c.name = ? OR t.name = ?)`;
        params.push(filter, filter);
      }
    }

    baseSql += ` GROUP BY k.id ORDER BY relevance_score DESC, k.created_at DESC LIMIT 50`;

    const rawResults = await db.getAllAsync<any>(baseSql, params);

    // Map DB rows back to KnowledgeItem schema
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
    console.error('Error executing search query:', error);
    return [];
  }
}
