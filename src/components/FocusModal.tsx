'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { GraphNode } from '@/lib/types';

interface FocusModalProps {
  node: GraphNode | null;
  onClose: () => void;
}

const CALM_PHRASES = [
  "This thought connects through calm intention and focus.",
  "Let this moment guide you toward clarity.",
  "Breathe into this space. You have time.",
  "Each step forward is a step toward peace.",
  "Trust the process. Trust yourself.",
];

export default function FocusModal({ node, onClose }: FocusModalProps) {
  if (!node) return null;

  const phrase = CALM_PHRASES[Math.floor(Math.random() * CALM_PHRASES.length)];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass rounded-3xl p-8 max-w-lg w-full border-glow"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Priority badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-block px-4 py-1 rounded-full text-xs font-secondary uppercase tracking-wider mb-4 bg-blue-500/20 text-blue-300 border border-blue-500/40"
          >
            {node.priority || 'medium'}
          </motion.div>

          {/* Node title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-heading font-bold mb-6 glow-blue"
          >
            {node.name}
          </motion.h2>

          {/* Calming phrase */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-300 font-body text-lg leading-relaxed mb-6 italic"
          >
            "{phrase}"
          </motion.p>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6 }}
            className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mb-6"
          />

          {/* Action button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={onClose}
            className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600
                     hover:brightness-110 font-secondary font-semibold text-white
                     transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/40"
          >
            Return to Map
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
