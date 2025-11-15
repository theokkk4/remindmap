'use client';

import { motion } from 'framer-motion';
import { Home, HelpCircle, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full py-4 px-4 glass"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Title */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push('/')}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
            <span className="text-white text-2xl relative z-10">🧠</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              ReMindMap
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Visualize • Connect • Execute
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="hidden sm:flex btn-icon items-center gap-2"
            title="Home"
          >
            <Home size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden sm:flex btn-icon items-center gap-2"
            title="Help"
          >
            <HelpCircle size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden sm:flex btn-icon items-center gap-2"
            title="Settings"
          >
            <Settings size={18} />
          </motion.button>
          <div className="glass-card px-4 py-2 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-blue-400 font-semibold">Active</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
