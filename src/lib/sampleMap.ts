// A ready-made map that builds itself node by node for demos.

type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface SampleNode {
  title: string;
  color: string;
  priority: Priority;
  x: number;
  y: number;
  description?: string;
  dueDate?: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
  reminderRecurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}

const inDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString().split('T')[0];

const polar = (angleDeg: number, dist: number) => {
  const a = (angleDeg * Math.PI) / 180;
  return { x: Math.round(Math.cos(a) * dist), y: Math.round(Math.sin(a) * dist) };
};

const BRANCHES: { title: string; color: string; priority: Priority; angle: number; leaves: string[]; extra?: Partial<SampleNode> }[] = [
  { title: 'Design', color: '#ec4899', priority: 'high', angle: -90, leaves: ['Wireframes', 'Color system'] },
  { title: 'Build', color: '#3b82f6', priority: 'high', angle: -18, leaves: ['Landing page', 'Auth flow'], extra: { dueDate: inDays(6) } },
  {
    title: 'Launch',
    color: '#f59e0b',
    priority: 'urgent',
    angle: 54,
    leaves: ['Product Hunt', 'Press kit'],
    extra: { dueDate: inDays(12), reminderEnabled: true, reminderTime: '09:00', reminderRecurrence: 'daily' },
  },
  { title: 'Research', color: '#14b8a6', priority: 'medium', angle: 126, leaves: ['User interviews', 'Competitors'] },
  { title: 'Study', color: '#22c55e', priority: 'low', angle: 198, leaves: ['Read 2 papers'], extra: { reminderEnabled: true, reminderTime: '20:00', reminderRecurrence: 'weekly' } },
];

export const SAMPLE_MAP: SampleNode[] = [
  { title: 'Launch my portfolio', color: '#8b5cf6', priority: 'urgent', x: 0, y: 0, description: 'Central goal for the quarter' },
  ...BRANCHES.map((b) => ({ title: b.title, color: b.color, priority: b.priority, ...polar(b.angle, 205), ...b.extra })),
  ...BRANCHES.flatMap((b) =>
    b.leaves.map((leaf, i) => ({
      title: leaf,
      color: b.color,
      priority: 'low' as Priority,
      ...polar(b.angle + (b.leaves.length === 1 ? 0 : i === 0 ? -17 : 17), 365),
    })),
  ),
];
