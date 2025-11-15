'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, Lightbulb, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Item } from '@/lib/types';
import { generateMapInsights } from '@/lib/ai/intelligence';
import { detectCluster } from '@/lib/ai/clustering';

interface AIInsightsProps {
  items: Item[];
}

export default function AIInsights({ items }: AIInsightsProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [clusters, setClusters] = useState<Record<string, number>>({});

  useEffect(() => {
    // Generate insights
    const newInsights = generateMapInsights(items);
    setInsights(newInsights);

    // Count clusters
    const clusterCount: Record<string, number> = {};
    items.forEach(item => {
      const result = detectCluster(item.title, item.description);
      clusterCount[result.cluster] = (clusterCount[result.cluster] || 0) + 1;
    });
    setClusters(clusterCount);
  }, [items]);

  if (items.length === 0) return null;

  const topClusters = Object.entries(clusters)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-6 left-6 z-30"
    >
      {!isExpanded ? (
        // Collapsed: Floating AI button
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 
                   hover:brightness-110 shadow-lg shadow-blue-500/40 border border-white/20
                   font-secondary font-semibold text-white transition-all"
        >
          <Brain size={20} className="animate-pulse" />
          <span>AI Insights</span>
          {insights.length > 0 && (
            <span className="px-2 py-1 rounded-full bg-white/30 text-xs font-bold">
              {insights.length}
            </span>
          )}
        </motion.button>
      ) : (
        // Expanded: Insights panel
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="rounded-2xl p-5 w-80 max-h-96 overflow-y-auto"
          style={{
            background: 'rgba(30, 30, 30, 0.98)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain size={20} className="text-blue-400" />
              <h3 className="font-heading text-lg font-bold text-white">AI Insights</h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </motion.button>
          </div>

          {/* Auto-detected Clusters */}
          {topClusters.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-blue-400" />
                <span className="text-xs font-secondary text-slate-300 uppercase tracking-wider">
                  Auto-Detected Topics
                </span>
              </div>
              <div className="space-y-2">
                {topClusters.map(([cluster, count]) => (
                  <motion.div
                    key={cluster}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-white/10 to-white/5"
                  >
                    <span className="text-sm font-body text-slate-200 capitalize">
                      {cluster}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
                      {count}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          {insights.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={14} className="text-amber-400" />
                <span className="text-xs font-secondary text-slate-300 uppercase tracking-wider">
                  Smart Suggestions
                </span>
              </div>
              <div className="space-y-2">
                {insights.map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20"
                  >
                    <p className="text-sm font-body text-slate-200 leading-relaxed">
                      {insight}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Living Network Indicator */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="mt-4 pt-4 border-t border-white/10 text-center"
          >
            <p className="text-xs font-body text-slate-400 italic">
              🧠 Network updating in real-time
            </p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
