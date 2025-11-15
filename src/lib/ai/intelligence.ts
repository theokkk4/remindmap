// Intelligence Layer - Makes ReMindMap "think"
// Provides smart suggestions, auto-organization, and insight

import { detectCluster, extractKeywords, findRelatedItems } from './clustering';
import type { Item } from '../types';

interface SmartSuggestion {
  type: 'cluster' | 'connection' | 'priority' | 'insight';
  message: string;
  action?: () => void;
  confidence: number;
}

/**
 * Analyze a new item and provide smart suggestions
 */
export function analyzeNewItem(item: Item, existingItems: Item[]): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  
  // 1. Suggest cluster if not set or if general
  const clusterResult = detectCluster(item.title, item.description);
  if (clusterResult.confidence > 0.3 && (!item.color || item.color === '#3b82f6')) {
    suggestions.push({
      type: 'cluster',
      message: `This looks like a ${clusterResult.cluster} item (${Math.round(clusterResult.confidence * 100)}% confident)`,
      confidence: clusterResult.confidence,
    });
  }
  
  // 2. Find related items
  const related = findRelatedItems(item, existingItems, 0.3);
  if (related.length > 0) {
    suggestions.push({
      type: 'connection',
      message: `Found ${related.length} related item${related.length > 1 ? 's' : ''} in your map`,
      confidence: related[0].similarity,
    });
  }
  
  // 3. Suggest priority based on keywords
  const urgentKeywords = ['urgent', 'asap', 'critical', 'emergency', 'now', 'today'];
  const highKeywords = ['important', 'priority', 'deadline', 'due', 'soon'];
  const text = `${item.title} ${item.description || ''}`.toLowerCase();
  
  if (urgentKeywords.some(k => text.includes(k)) && item.priority !== 'urgent') {
    suggestions.push({
      type: 'priority',
      message: 'This might be urgent based on your wording',
      confidence: 0.8,
    });
  } else if (highKeywords.some(k => text.includes(k)) && item.priority === 'low') {
    suggestions.push({
      type: 'priority',
      message: 'Consider setting this to high priority',
      confidence: 0.6,
    });
  }
  
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Generate insights about the overall mind map
 */
export function generateMapInsights(items: Item[]): string[] {
  const insights: string[] = [];
  
  if (items.length === 0) return ['Your mind map is empty. Add your first thought!'];
  
  // Count by priority
  const urgent = items.filter(i => i.priority === 'urgent').length;
  const high = items.filter(i => i.priority === 'high').length;
  
  if (urgent > 3) {
    insights.push(`⚠️ You have ${urgent} urgent items - consider focusing on these first`);
  }
  
  if (high > 5) {
    insights.push(`📌 ${high} high-priority items might benefit from breaking down into smaller tasks`);
  }
  
  // Check for overdue items
  const now = new Date();
  const overdue = items.filter(i => i.dueDate && new Date(i.dueDate) < now && !i.completed).length;
  if (overdue > 0) {
    insights.push(`🕐 ${overdue} item${overdue > 1 ? 's' : ''} past due date`);
  }
  
  // Completion rate
  const completed = items.filter(i => i.completed).length;
  if (completed > 0) {
    const rate = Math.round((completed / items.length) * 100);
    insights.push(`✅ ${rate}% completion rate - keep it up!`);
  }
  
  // Cluster diversity
  const keywords = items.flatMap(i => extractKeywords(`${i.title} ${i.description || ''}`));
  const uniqueKeywords = new Set(keywords);
  if (uniqueKeywords.size > 20) {
    insights.push(`🧠 Your map spans ${uniqueKeywords.size} different concepts - you're thinking big!`);
  }
  
  return insights.slice(0, 3); // Top 3 insights
}

/**
 * Suggest optimal layout based on content relationships
 */
export function suggestOptimalLayout(items: Item[]): 'force' | 'radial' | 'hierarchical' {
  // Analyze structure
  const keywords = items.flatMap(i => extractKeywords(`${i.title} ${i.description || ''}`));
  const uniqueClusters = new Set(items.map(i => detectCluster(i.title, i.description).cluster));
  
  // If highly clustered, use radial
  if (uniqueClusters.size <= 3 && items.length > 8) {
    return 'radial';
  }
  
  // If hierarchical (many priorities), use tree
  const hasPrioritySpread = new Set(items.map(i => i.priority)).size >= 3;
  if (hasPrioritySpread && items.length > 10) {
    return 'hierarchical';
  }
  
  // Default to force-directed (most flexible)
  return 'force';
}

/**
 * Smart color suggestion based on content
 */
export function suggestColor(title: string, description?: string): string {
  const result = detectCluster(title, description);
  
  const clusterColors: Record<string, string> = {
    work: '#3b82f6',
    personal: '#8b5cf6',
    learning: '#10b981',
    creative: '#ec4899',
    finance: '#f59e0b',
    health: '#06b6d4',
    social: '#a855f7',
    tech: '#0ea5e9',
    general: '#6b7280',
  };
  
  return clusterColors[result.cluster] || clusterColors.general;
}
