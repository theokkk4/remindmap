// AI-Powered Auto-Clustering Engine
// Automatically groups related thoughts and tasks using keyword similarity

interface ClusterResult {
  cluster: string;
  confidence: number;
  keywords: string[];
}

// Common stop words to filter out
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
  'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her',
  'its', 'our', 'their', 'me', 'him', 'them', 'us'
]);

// Predefined cluster categories with keywords
const CLUSTER_PATTERNS = {
  work: ['project', 'meeting', 'deadline', 'team', 'client', 'presentation', 'report', 'review', 'call', 'email'],
  personal: ['home', 'family', 'friend', 'birthday', 'appointment', 'doctor', 'dentist', 'gym', 'exercise'],
  learning: ['study', 'read', 'course', 'tutorial', 'research', 'learn', 'practice', 'book', 'article'],
  creative: ['design', 'write', 'create', 'brainstorm', 'idea', 'sketch', 'draft', 'concept', 'art'],
  finance: ['budget', 'pay', 'bill', 'invoice', 'expense', 'tax', 'money', 'purchase', 'subscription'],
  health: ['workout', 'meal', 'sleep', 'meditation', 'therapy', 'medicine', 'health', 'wellness', 'fitness'],
  social: ['party', 'event', 'dinner', 'lunch', 'coffee', 'hangout', 'meetup', 'celebrate', 'visit'],
  tech: ['code', 'debug', 'deploy', 'fix', 'update', 'install', 'configure', 'setup', 'build', 'test'],
};

/**
 * Extract keywords from text (remove stop words, normalize)
 */
export function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word))
    .slice(0, 10); // Top 10 keywords
}

/**
 * Calculate similarity between two sets of keywords (Jaccard similarity)
 */
export function calculateSimilarity(keywords1: string[], keywords2: string[]): number {
  if (keywords1.length === 0 || keywords2.length === 0) return 0;
  
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * AI-powered cluster detection - analyzes content and suggests cluster
 */
export function detectCluster(title: string, description?: string): ClusterResult {
  const text = `${title} ${description || ''}`.toLowerCase();
  const keywords = extractKeywords(text);
  
  let bestCluster = 'general';
  let bestScore = 0;
  let matchedKeywords: string[] = [];
  
  // Check against each cluster pattern
  for (const [cluster, patterns] of Object.entries(CLUSTER_PATTERNS)) {
    let score = 0;
    const matches: string[] = [];
    
    for (const pattern of patterns) {
      if (text.includes(pattern)) {
        score += 2; // Exact match gets high score
        matches.push(pattern);
      }
      // Check if any keyword is similar
      for (const keyword of keywords) {
        if (keyword.includes(pattern) || pattern.includes(keyword)) {
          score += 1;
          matches.push(keyword);
        }
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestCluster = cluster;
      matchedKeywords = matches;
    }
  }
  
  return {
    cluster: bestCluster,
    confidence: Math.min(bestScore / 5, 1), // Normalize to 0-1
    keywords: [...new Set(matchedKeywords)].slice(0, 3),
  };
}

/**
 * Find related items based on content similarity
 */
export function findRelatedItems(
  targetItem: { title: string; description?: string },
  allItems: { id: string; title: string; description?: string }[],
  threshold: number = 0.2
): { id: string; similarity: number }[] {
  const targetKeywords = extractKeywords(`${targetItem.title} ${targetItem.description || ''}`);
  
  return allItems
    .map(item => {
      const itemKeywords = extractKeywords(`${item.title} ${item.description || ''}`);
      const similarity = calculateSimilarity(targetKeywords, itemKeywords);
      
      return { id: item.id, similarity };
    })
    .filter(result => result.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5); // Top 5 most related
}

/**
 * Auto-generate smart connections between items
 */
export function generateSmartConnections(
  items: { id: string; title: string; description?: string; priority?: string }[]
): { source: string; target: string; strength: number; reason: string }[] {
  const connections: { source: string; target: string; strength: number; reason: string }[] = [];
  
  for (let i = 0; i < items.length; i++) {
    const related = findRelatedItems(items[i], items.filter((_, idx) => idx !== i), 0.25);
    
    for (const rel of related.slice(0, 2)) { // Max 2 connections per item
      // Avoid duplicates
      const exists = connections.some(
        c => (c.source === items[i].id && c.target === rel.id) ||
             (c.source === rel.id && c.target === items[i].id)
      );
      
      if (!exists && rel.similarity > 0.25) {
        connections.push({
          source: items[i].id,
          target: rel.id,
          strength: rel.similarity,
          reason: rel.similarity > 0.5 ? 'Highly related' : 'Related',
        });
      }
    }
  }
  
  return connections;
}

/**
 * Get cluster color based on category
 */
export function getClusterColor(cluster: string): string {
  // Frutiger Aero palette - soft, glossy colors
  const colors: Record<string, string> = {
    work: '#60a5fa',      // Soft blue
    personal: '#a78bfa',   // Soft purple
    learning: '#6ee7b7',   // Soft mint
    creative: '#f9a8d4',   // Soft pink
    finance: '#fcd34d',    // Soft yellow
    health: '#7dd3fc',     // Soft cyan
    social: '#c4b5fd',     // Soft lavender
    tech: '#93c5fd',       // Soft sky
    general: '#cbd5e1',    // Soft gray
  };
  
  return colors[cluster] || colors.general;
}

/**
 * Get cluster icon/emoji
 */
export function getClusterIcon(cluster: string): string {
  const icons: Record<string, string> = {
    work: '💼',
    personal: '🏠',
    learning: '📚',
    creative: '🎨',
    finance: '💰',
    health: '🏃',
    social: '👥',
    tech: '💻',
    general: '📝',
  };
  
  return icons[cluster] || icons.general;
}
