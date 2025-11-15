import { z } from 'zod';

export const ItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  color: z.string().optional(),
  completed: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  reminderEnabled: z.boolean().optional(),
  reminderTime: z.string().optional(), // Time in HH:MM format
  reminderRecurrence: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(),
  lastNotified: z.date().optional(),
});

export type Item = z.infer<typeof ItemSchema>;

export interface GraphNode {
  id: string;
  name: string;
  description?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  val: number;
  color: string;
  completed?: boolean;
}

export interface GraphLink {
  source: string;
  target: string;
  color: string;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
