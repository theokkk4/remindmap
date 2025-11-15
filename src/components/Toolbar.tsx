'use client';

import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Download, ZoomIn, ZoomOut, Maximize2, Bell } from 'lucide-react';

interface ToolbarProps {
  onAddNode: () => void;
  onToggleEditMode: () => void;
  onClearAll: () => void;
  onExport: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onOpenReminders: () => void;
  editMode: boolean;
  nodeCount: number;
}

export default function Toolbar({
  onAddNode,
  onToggleEditMode,
  onClearAll,
  onExport,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onOpenReminders,
  editMode,
  nodeCount,
}: ToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="glass rounded-xl p-3 flex flex-wrap items-center gap-2 md:gap-3"
    >
      {/* Add Node */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAddNode}
        className="btn-primary flex items-center gap-2"
        title="Add Node (Ctrl+N)"
      >
        <Plus size={18} />
        <span className="hidden sm:inline">Add Node</span>
      </motion.button>

      {/* Edit Mode Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleEditMode}
        className={`flex items-center gap-2 ${
          editMode ? 'btn-primary' : 'btn-secondary'
        }`}
        title="Toggle Edit Mode (E)"
      >
        <Edit3 size={18} />
        <span className="hidden sm:inline">{editMode ? 'Editing' : 'View'}</span>
      </motion.button>

      {/* Divider */}
      <div className="w-px h-8 bg-white/20" />

      {/* Reminders */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpenReminders}
        className="btn-secondary flex items-center gap-2"
        title="View Reminders"
      >
        <Bell size={18} />
        <span className="hidden sm:inline text-sm">Reminders</span>
      </motion.button>

      {/* Divider */}
      <div className="w-px h-8 bg-white/20" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onZoomIn}
          className="btn-icon"
          title="Zoom In (+)"
        >
          <ZoomIn size={18} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onZoomOut}
          className="btn-icon"
          title="Zoom Out (-)"
        >
          <ZoomOut size={18} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onZoomFit}
          className="btn-icon"
          title="Fit to Screen (F)"
        >
          <Maximize2 size={18} />
        </motion.button>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-white/20" />

      {/* Export */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onExport}
        className="btn-secondary flex items-center gap-2"
        title="Export as JSON"
      >
        <Download size={18} />
        <span className="hidden sm:inline">Export</span>
      </motion.button>

      {/* Clear All */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClearAll}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:brightness-110 text-white font-semibold transition-all shadow-md shadow-red-500/30"
        title="Clear All Nodes"
      >
        <Trash2 size={18} />
        <span className="hidden sm:inline">Clear</span>
      </motion.button>

      {/* Node Count */}
      <div className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg glass-card text-sm">
        <span className="font-semibold text-blue-400">{nodeCount}</span> 
        <span className="text-gray-300">nodes</span>
      </div>
    </motion.div>
  );
}
