import { db } from '../store/db';
import type { Item } from '../types';

const DEMO_ITEMS: Omit<Item, 'createdAt' | 'updatedAt'>[] = [
  { 
    id: '1', 
    title: 'Complete project proposal', 
    description: 'Draft and submit Q1 proposal',
    priority: 'high',
    color: '#ef4444',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  },
  { 
    id: '2', 
    title: 'Team meeting prep', 
    description: 'Prepare slides and agenda',
    priority: 'medium',
    color: '#f59e0b',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
  },
  { 
    id: '3', 
    title: 'Review PR #245', 
    priority: 'medium',
    color: '#3b82f6',
  },
  { 
    id: '4', 
    title: 'Update documentation', 
    priority: 'low',
    color: '#06b6d4',
  },
  { 
    id: '5', 
    title: 'Client call follow-up', 
    description: 'Send summary email',
    priority: 'high',
    color: '#8b5cf6',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
];

export async function seedDemoData(): Promise<void> {
  const count = await db.items.count();
  
  if (count === 0) {
    console.log('🌱 Seeding demo data...');
    
    try {
      const now = new Date();
      const itemsWithDate: Item[] = DEMO_ITEMS.map(item => ({
        ...item,
        createdAt: now,
        updatedAt: now,
        completed: false,
      }));
      
      // Use put instead of add to avoid duplicate key errors
      for (const item of itemsWithDate) {
        await db.items.put(item);
      }
      console.log('✅ Demo data seeded successfully');
    } catch (error) {
      console.log('Demo data already exists, skipping seed');
    }
  }
}
