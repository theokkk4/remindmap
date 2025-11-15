'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, Circle, Calendar, AlertCircle, X, Bell } from 'lucide-react';
import { useState } from 'react';
import type { Item } from '@/lib/types';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface ReminderListProps {
  items: Item[];
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReminderList({ items, onToggleComplete, onDelete, isOpen, onClose }: ReminderListProps) {
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue'>('all');

  // Filter items with due dates
  const reminders = items.filter(item => item.dueDate);

  // Categorize reminders
  const todayReminders = reminders.filter(item => item.dueDate && isToday(item.dueDate));
  const upcomingReminders = reminders.filter(item => 
    item.dueDate && !isToday(item.dueDate) && !isPast(item.dueDate)
  );
  const overdueReminders = reminders.filter(item => 
    item.dueDate && isPast(item.dueDate) && !item.completed
  );

  const getFilteredReminders = () => {
    switch (filter) {
      case 'today':
        return todayReminders;
      case 'upcoming':
        return upcomingReminders;
      case 'overdue':
        return overdueReminders;
      default:
        return reminders;
    }
  };

  const filteredReminders = getFilteredReminders().sort((a, b) => {
    if (!a.dueDate || !b.dueDate) return 0;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const formatDueDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: '#ef4444',
      high: '#f59e0b',
      medium: '#3b82f6',
      low: '#6b7280'
    };
    return colors[priority] || colors.medium;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -400, opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed left-0 top-0 h-full w-full sm:w-96 z-40 overflow-y-auto"
        style={{
          background: 'rgba(30, 30, 30, 0.98)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-white/10" style={{ background: 'rgba(30, 30, 30, 0.98)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell size={24} className="text-blue-400" />
              <h2 className="font-heading text-2xl font-bold text-white">Reminders</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
            >
              <X size={20} className="text-slate-400" />
            </motion.button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All', count: reminders.length },
              { key: 'today', label: 'Today', count: todayReminders.length },
              { key: 'upcoming', label: 'Upcoming', count: upcomingReminders.length },
              { key: 'overdue', label: 'Overdue', count: overdueReminders.length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  filter === tab.key
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Reminder List */}
        <div className="p-4 space-y-3">
          {filteredReminders.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-body">No reminders {filter !== 'all' && `for ${filter}`}</p>
            </div>
          ) : (
            filteredReminders.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                style={{ background: 'rgba(40, 40, 40, 0.6)' }}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => onToggleComplete(item.id, !item.completed)}
                    className="mt-1 flex-shrink-0"
                  >
                    {item.completed ? (
                      <CheckCircle2 size={20} className="text-green-400" />
                    ) : (
                      <Circle size={20} className="text-slate-300 hover:text-blue-400 transition-colors" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-secondary font-semibold text-white mb-1 ${
                      item.completed ? 'line-through opacity-50' : ''
                    }`}>
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-sm text-slate-400 mb-2 line-clamp-2">{item.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs">
                      {/* Due Date */}
                      {item.dueDate && (
                        <div className={`flex items-center gap-1 ${
                          isPast(item.dueDate) && !item.completed ? 'text-red-400' : 'text-slate-500'
                        }`}>
                          <Calendar size={12} />
                          <span>{formatDueDate(item.dueDate)}</span>
                        </div>
                      )}

                      {/* Priority Badge */}
                      {item.priority && (
                        <div
                          className="px-2 py-0.5 rounded-full font-semibold uppercase"
                          style={{
                            backgroundColor: `${getPriorityColor(item.priority)}20`,
                            color: getPriorityColor(item.priority),
                            fontSize: '10px'
                          }}
                        >
                          {item.priority}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => onDelete(item.id)}
                    className="flex-shrink-0 p-1 rounded hover:bg-red-500/20 transition-colors"
                  >
                    <X size={16} className="text-slate-300 hover:text-red-400" />
                  </button>
                </div>

                {/* Overdue Warning */}
                {item.dueDate && isPast(item.dueDate) && !item.completed && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle size={12} />
                    <span>Overdue</span>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
