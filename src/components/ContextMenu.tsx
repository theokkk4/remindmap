'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Trash2, Copy } from 'lucide-react';
import { useEffect } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onClose: () => void;
}

export default function ContextMenu({ x, y, onEdit, onDelete, onDuplicate, onClose }: ContextMenuProps) {
  useEffect(() => {
    const handleClickOutside = () => onClose();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50 glass rounded-xl border border-white/10 overflow-hidden shadow-2xl"
        style={{ left: x, top: y }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-2 min-w-[180px]">
          <button
            onClick={() => { onEdit(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-indigo-600/20 transition-all text-left font-body text-sm text-white"
          >
            <Edit3 size={16} className="text-blue-400" />
            <span>Edit Node</span>
          </button>
          <button
            onClick={() => { onDuplicate(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-indigo-600/20 transition-all text-left font-body text-sm text-white"
          >
            <Copy size={16} className="text-blue-400" />
            <span>Duplicate</span>
          </button>
          <div className="h-px bg-white/10 my-2" />
          <button
            onClick={() => { onDelete(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-orange-500/20 transition-all text-left font-body text-sm text-red-300"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
