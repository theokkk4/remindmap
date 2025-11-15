import Dexie, { type EntityTable } from 'dexie';
import type { Item } from '../types';

const db = new Dexie('ReMindMapDB') as Dexie & {
  items: EntityTable<Item, 'id'>;
};

// Schema declaration
db.version(1).stores({
  items: 'id, title, priority, dueDate, completed, createdAt, updatedAt',
});

export { db };

export async function getAllItems(): Promise<Item[]> {
  return await db.items.toArray();
}

export async function addItem(item: Omit<Item, 'id'>): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date();
  await db.items.add({
    ...item,
    id,
    createdAt: item.createdAt || now,
    updatedAt: now,
    completed: item.completed ?? false,
  });
  return id;
}

export async function deleteItem(id: string): Promise<void> {
  await db.items.delete(id);
}

export async function clearAllItems(): Promise<void> {
  await db.items.clear();
}

export async function updateItem(id: string, updates: Partial<Item>): Promise<void> {
  await db.items.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
}

export async function duplicateItem(id: string): Promise<string> {
  const item = await db.items.get(id);
  if (!item) throw new Error('Item not found');
  
  const newId = crypto.randomUUID();
  await db.items.add({
    ...item,
    id: newId,
    title: `${item.title} (copy)`,
    createdAt: new Date(),
  });
  return newId;
}
