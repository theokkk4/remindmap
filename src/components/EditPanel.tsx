'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Calendar, Flag, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { GraphNode } from '@/lib/types';
import { format } from 'date-fns';
import { detectCluster, getClusterColor, getClusterIcon } from '@/lib/ai/clustering';
import { suggestColor } from '@/lib/ai/intelligence';

interface EditPanelProps {
  node: GraphNode | null;
  onClose: () => void;
  onSave: (id: string, updates: { name: string; description?: string; priority?: string; color?: string; dueDate?: Date }) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_COLORS = {
  low: '#06b6d4',
  medium: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
};

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

export default function EditPanel({ node, onClose, onSave, onDelete }: EditPanelProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [color, setColor] = useState('#3b82f6');
  const [dueDate, setDueDate] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  useEffect(() => {
    if (node) {
      setName(node.name);
      setDescription(node.description || '');
      setPriority(node.priority || 'medium');
      setColor(node.color || '#3b82f6');
      setDueDate(node.dueDate ? format(node.dueDate, 'yyyy-MM-dd') : '');
      
      // AI: Generate suggestion based on content
      const cluster = detectCluster(node.name, node.description);
      if (cluster.confidence > 0.4) {
        const icon = getClusterIcon(cluster.cluster);
        setAiSuggestion(`${icon} AI thinks this is ${cluster.cluster}-related (${Math.round(cluster.confidence * 100)}% confident)`);
      } else {
        setAiSuggestion(null);
      }
    }
  }, [node]);
  
  // AI: Auto-suggest color when title/description changes
  useEffect(() => {
    if (name.length > 3) {
      const suggested = suggestColor(name, description);
      if (suggested !== color && Math.random() > 0.7) { // Only sometimes to avoid being annoying
        // Don't auto-change, just show hint
      }
    }
  }, [name, description]);

  if (!node) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(node.id, { 
        name: name.trim(), 
        description: description.trim() || undefined,
        priority: priority as any,
        color,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
      onClose();
    }
  };

  const handleDelete = () => {
    if (confirm(`Delete "${node.name}"?`)) {
      onDelete(node.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full sm:w-96 border-l border-white/10 z-40 p-6 overflow-y-auto"
        style={{
          background: 'rgba(30, 30, 30, 0.98)',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-xl font-bold text-slate-100">Edit Node</h3>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </motion.button>
        </div>

        {/* AI Suggestion Banner */}
        {aiSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30"
          >
            <div className="flex items-center gap-2 text-sm text-cyan-300">
              <Sparkles size={16} className="animate-pulse" />
              <span>{aiSuggestion}</span>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <div className="space-y-5">
          {/* Node Title */}
          <div>
            <label className="block text-sm font-secondary text-slate-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full px-4 py-3 rounded-xl border border-white/10 
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                       text-white font-body transition-all touch-manipulation"
              style={{ background: 'rgba(40, 40, 40, 0.8)' }}
              placeholder="Enter reminder title..."
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-secondary text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-white/10 
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                       text-white font-body transition-all resize-none touch-manipulation"
              style={{ background: 'rgba(40, 40, 40, 0.8)' }}
              placeholder="Add details..."
            />
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-secondary text-slate-300 mb-3 flex items-center gap-2">
              <Flag size={16} />
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                <motion.button
                  key={p}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPriority(p)}
                  className={`p-3 rounded-xl border-2 transition-all font-secondary text-xs uppercase touch-manipulation ${
                    priority === p
                      ? 'border-white/40 shadow-lg'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                  style={{
                    backgroundColor: priority === p ? `${PRIORITY_COLORS[p]}20` : undefined,
                    borderColor: priority === p ? PRIORITY_COLORS[p] : undefined,
                    color: priority === p ? PRIORITY_COLORS[p] : undefined,
                  }}
                >
                  {p}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-secondary text-slate-300 mb-2 flex items-center gap-2">
              <Calendar size={16} />
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/10 
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                       text-white font-body transition-all touch-manipulation"
              style={{ background: 'rgba(40, 40, 40, 0.8)' }}
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-secondary text-slate-300 mb-3">
              Color
            </label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((c) => (
                <motion.button
                  key={c}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-xl border-2 transition-all touch-manipulation ${
                    color === c ? 'border-white scale-110 shadow-lg' : 'border-white/20'
                  }`}
                  style={{ backgroundColor: c, boxShadow: `0 0 20px ${c}40` }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-xl border border-white/10" style={{ background: 'rgba(40, 40, 40, 0.6)' }}>
            <div className="text-xs font-secondary text-slate-400 mb-3">Preview</div>
            <div 
              className="inline-block px-4 py-2 rounded-full text-xs font-secondary font-semibold shadow-lg"
              style={{ 
                backgroundColor: `${color}30`, 
                color: color,
                border: `2px solid ${color}60`,
                boxShadow: `0 0 15px ${color}40`
              }}
            >
              {priority.toUpperCase()}
            </div>
            <div className="mt-3 text-lg font-heading font-semibold" style={{ color }}>
              {name || 'Untitled Node'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={!name.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={18} />
              Save Changes
            </motion.button>
          </div>

          {/* Delete Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDelete}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:brightness-110 text-white font-semibold transition-all shadow-md shadow-red-500/30 mt-3"
          >
            Delete Node
          </motion.button>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-xs font-secondary text-slate-400 mb-3">Keyboard Shortcuts</div>
          <div className="space-y-2 text-xs font-body text-slate-300">
            <div className="flex justify-between">
              <span>Save</span>
              <kbd className="px-2 py-1 rounded bg-white/10">Enter</kbd>
            </div>
            <div className="flex justify-between">
              <span>Close</span>
              <kbd className="px-2 py-1 rounded bg-white/10">Esc</kbd>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
