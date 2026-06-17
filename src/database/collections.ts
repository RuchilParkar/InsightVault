import * as SQLite from 'expo-sqlite';
import { Collection } from '../types/schemas';
import * as Crypto from 'expo-crypto';

const DEFAULT_COLLECTIONS = ['Development', 'Design', 'AI', 'Productivity', 'Startups'];

export async function createCollection(db: SQLite.SQLiteDatabase, name: string): Promise<Collection | null> {
  try {
    const newCollection: Collection = {
      id: Crypto.randomUUID(),
      name: name.trim(),
      createdAt: Date.now()
    };

    await db.runAsync(
      `INSERT INTO collections (id, name, created_at) VALUES (?, ?, ?)`,
      [newCollection.id, newCollection.name, newCollection.createdAt]
    );
    return newCollection;
  } catch (error) {
    console.error('Error creating collection:', error);
    return null;
  }
}

export async function deleteCollection(db: SQLite.SQLiteDatabase, id: string, name: string): Promise<boolean> {
  if (DEFAULT_COLLECTIONS.includes(name)) {
    throw new Error('Cannot delete a default collection.');
  }

  try {
    await db.runAsync(`DELETE FROM collections WHERE id = ?`, [id]);
    return true;
  } catch (error) {
    console.error('Error deleting collection:', error);
    return false;
  }
}

export async function renameCollection(db: SQLite.SQLiteDatabase, id: string, oldName: string, newName: string): Promise<boolean> {
  if (DEFAULT_COLLECTIONS.includes(oldName)) {
    throw new Error('Cannot rename a default collection.');
  }

  try {
    await db.runAsync(`UPDATE collections SET name = ? WHERE id = ?`, [newName.trim(), id]);
    return true;
  } catch (error) {
    console.error('Error renaming collection:', error);
    return false;
  }
}

// Automatically create defaults on first run if they don't exist
export async function ensureDefaultCollections(db: SQLite.SQLiteDatabase): Promise<Collection[]> {
  const existing = await db.getAllAsync<Collection>(`SELECT * FROM collections`);
  const existingNames = existing.map(e => e.name);
  
  const created: Collection[] = [];
  
  for (const name of DEFAULT_COLLECTIONS) {
    if (!existingNames.includes(name)) {
      const col = await createCollection(db, name);
      if (col) created.push(col);
    }
  }
  
  return [...existing, ...created];
}
