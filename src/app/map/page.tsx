'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAllItems, addItem, updateItem, deleteItem, clearAllItems } from '@/lib/store/db';
import type { Item } from '@/lib/types';
import { requestNotificationPermission, checkReminders } from '@/lib/notifications';
import { MapEngine } from '@/lib/mapEngine';
import { SAMPLE_MAP } from '@/lib/sampleMap';

interface CanvasNode {
  id: string;
  x: number;
  y: number;
  title: string;
  color: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  dueDate: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
  reminderRecurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export default function MapPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<MapEngine | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAdd, setQuickAdd] = useState({ title: '', color: '#3b82f6', priority: 'medium' as CanvasNode['priority'] });
  const [isSeeding, setIsSeeding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showInsights, setShowInsights] = useState(false);
  const [showMapStats, setShowMapStats] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [sessionStart] = useState(new Date());
  const [sessionNodesAdded, setSessionNodesAdded] = useState(0);
  const [sessionNodesRemoved, setSessionNodesRemoved] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    color: '#3b82f6',
    description: '',
    dueDate: '',
    reminderEnabled: false,
    reminderTime: '09:00',
    reminderRecurrence: 'none' as 'none' | 'daily' | 'weekly' | 'monthly'
  });

  // Check if tips have been dismissed
  useEffect(() => {
    const tipsDismissed = localStorage.getItem('remindmap-tips-dismissed');
    if (tipsDismissed === 'true') {
      setShowTips(false);
    }
  }, []);

  // Request notification permission and load data from IndexedDB
  useEffect(() => {
    async function init() {
      // Request notification permission
      const hasPermission = await requestNotificationPermission();
      if (hasPermission) {
        console.log('Notification permission granted');
      }

      // Load data
      const items = await getAllItems();
      const canvasNodes: CanvasNode[] = items.map((item, index) => ({
        id: item.id,
        x: item.x ?? (Math.cos(index * Math.PI / 3) * 200) + (Math.random() - 0.5) * 50,
        y: item.y ?? (Math.sin(index * Math.PI / 3) * 200) + (Math.random() - 0.5) * 50,
        title: item.title,
        color: item.color || '#3b82f6',
        priority: item.priority || 'medium',
        description: item.description || '',
        dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
        reminderEnabled: item.reminderEnabled || false,
        reminderTime: item.reminderTime || '09:00',
        reminderRecurrence: item.reminderRecurrence || 'none'
      }));
      setNodes(canvasNodes);

      // Start checking reminders every minute
      const intervalId = setInterval(() => {
        checkReminders(items);
      }, 60000);

      // Minimum loading time for smooth transition
      setTimeout(() => {
        setIsLoading(false);
      }, 800);

      return () => clearInterval(intervalId);
    }
    init();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === 'n') {
        e.preventDefault();
        handleAddNode();
      } else if (key === 's') {
        e.preventDefault();
        setShowExportMenu(prev => !prev);
      } else if (key === 'i') {
        e.preventDefault();
        setShowMapStats(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Animated canvas: the engine owns rendering, physics and pointer input.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new MapEngine(canvas, {
      onSelect: (id) => selectNodeRef.current(id),
      onMove: (id, x, y) => {
        setNodes(prev => prev.map(n => (n.id === id ? { ...n, x, y } : n)));
        updateItem(id, { x, y });
      },
      onZoom: (z) => setZoom(Math.round(z * 100) / 100),
    });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setNodes(nodes);
  }, [nodes]);

  useEffect(() => {
    engineRef.current?.setSelected(selectedNode);
  }, [selectedNode]);

  useEffect(() => {
    engineRef.current?.setZoom(zoom);
  }, [zoom]);

  const selectNodeRef = useRef<(id: string | null) => void>(() => {});
  selectNodeRef.current = (id) => {
    if (id) {
      selectNode(id);
    } else {
      setSelectedNode(null);
      setIsPanelOpen(false);
    }
  };

  const selectNode = (id: string) => {
    const node = nodes.find(n => n.id === id);
    if (node) {
      setSelectedNode(id);
      setFormData({
        title: node.title,
        priority: node.priority,
        color: node.color,
        description: node.description,
        dueDate: node.dueDate,
        reminderEnabled: node.reminderEnabled || false,
        reminderTime: node.reminderTime || '09:00',
        reminderRecurrence: node.reminderRecurrence || 'none'
      });
      setIsPanelOpen(true);
    }
  };

  const handleAddNode = () => {
    setQuickAdd(q => ({ ...q, title: '' }));
    setShowQuickAdd(true);
  };

  const createNode = async (title: string, color: string, priority: CanvasNode['priority'], at?: { x: number; y: number }, extra: Partial<CanvasNode> = {}) => {
    const pos = at ?? engineRef.current?.suggestPosition(selectedNode) ?? { x: 0, y: 0 };
    const id = await addItem({
      title,
      priority,
      color,
      x: pos.x,
      y: pos.y,
      description: extra.description,
      dueDate: extra.dueDate ? new Date(extra.dueDate) : undefined,
      reminderEnabled: extra.reminderEnabled,
      reminderTime: extra.reminderTime,
      reminderRecurrence: extra.reminderRecurrence,
    });
    const newNode: CanvasNode = {
      id,
      x: pos.x,
      y: pos.y,
      title,
      color,
      priority,
      description: extra.description ?? '',
      dueDate: extra.dueDate ?? '',
      reminderEnabled: extra.reminderEnabled ?? false,
      reminderTime: extra.reminderTime ?? '09:00',
      reminderRecurrence: extra.reminderRecurrence ?? 'none',
    };
    setNodes(prev => [...prev, newNode]);
    setSessionNodesAdded(prev => prev + 1);
    return newNode;
  };

  const submitQuickAdd = async () => {
    const title = quickAdd.title.trim();
    if (!title) return;
    setShowQuickAdd(false);
    const node = await createNode(title, quickAdd.color, quickAdd.priority);
    setSelectedNode(node.id);
    setFormData({
      title: node.title,
      priority: node.priority,
      color: node.color,
      description: node.description,
      dueDate: node.dueDate,
      reminderEnabled: false,
      reminderTime: '09:00',
      reminderRecurrence: 'none',
    });
    setIsPanelOpen(true);
  };

  // Builds a sample map one node at a time, so it animates in.
  const loadSampleMap = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    setShowTips(false);
    for (const n of SAMPLE_MAP) {
      await createNode(n.title, n.color, n.priority, { x: n.x, y: n.y }, n);
      await new Promise(r => setTimeout(r, 260));
    }
    setIsSeeding(false);
    setTimeout(() => engineRef.current?.fit(), 300);
  };

  const handleSaveNode = async () => {
    if (!selectedNode) return;

    await updateItem(selectedNode, {
      title: formData.title,
      priority: formData.priority,
      color: formData.color,
      description: formData.description,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      reminderEnabled: formData.reminderEnabled,
      reminderTime: formData.reminderTime,
      reminderRecurrence: formData.reminderRecurrence
    });

    setNodes(nodes.map(n =>
      n.id === selectedNode
        ? { ...n, ...formData }
        : n
    ));

    setIsPanelOpen(false);
    setSelectedNode(null);
  };

  const handleDeleteNode = async () => {
    if (!selectedNode) return;

    await deleteItem(selectedNode);
    setNodes(nodes.filter(n => n.id !== selectedNode));
    setIsPanelOpen(false);
    setSelectedNode(null);
    setSessionNodesRemoved(prev => prev + 1);
  };

  const handleClearAll = async () => {
    if (!confirm('Clear all nodes? This cannot be undone.')) return;
    await clearAllItems();
    setNodes([]);
    setIsPanelOpen(false);
    setSelectedNode(null);
  };

  const handleDismissTips = () => {
    setShowTips(false);
    localStorage.setItem('remindmap-tips-dismissed', 'true');
  };

  // Calculate insights
  const getInsights = useCallback(() => {
    if (nodes.length === 0) {
      return {
        mostConnected: 'No nodes yet',
        clusters: 0,
        suggestion: 'Add your first node to get started!'
      };
    }

    // Find most central node (closest to average position)
    const avgX = nodes.reduce((sum, n) => sum + n.x, 0) / nodes.length;
    const avgY = nodes.reduce((sum, n) => sum + n.y, 0) / nodes.length;
    const mostCentral = nodes.reduce((closest, node) => {
      const dist = Math.sqrt(Math.pow(node.x - avgX, 2) + Math.pow(node.y - avgY, 2));
      const closestDist = Math.sqrt(Math.pow(closest.x - avgX, 2) + Math.pow(closest.y - avgY, 2));
      return dist < closestDist ? node : closest;
    });

    // Count clusters by priority/color
    const uniqueColors = new Set(nodes.map(n => n.color)).size;

    // Simple suggestions based on data
    let suggestion = '';
    const hasReminders = nodes.some(n => n.reminderEnabled);
    const hasDueDates = nodes.some(n => n.dueDate);
    const highPriorityCount = nodes.filter(n => n.priority === 'high' || n.priority === 'urgent').length;

    if (!hasReminders) {
      suggestion = 'Try adding reminders to stay on track';
    } else if (!hasDueDates) {
      suggestion = 'Set due dates to prioritize your tasks';
    } else if (highPriorityCount > nodes.length / 2) {
      suggestion = 'Many urgent items - consider breaking them down';
    } else if (nodes.length < 5) {
      suggestion = 'Add more nodes to build your mind map';
    } else {
      suggestion = 'Your map is well organized!';
    }

    return {
      mostConnected: mostCentral.title,
      clusters: uniqueColors,
      suggestion
    };
  }, [nodes]);

  // Session duration
  const getSessionDuration = () => {
    const diff = new Date().getTime() - sessionStart.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Less than a minute';
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  };

  const exportAsJSON = () => {
    // Remove coordinates from export
    const exportData = nodes.map(({ x, y, ...rest }) => rest);
    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remindmap-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportAsCopyText = async () => {
    // Create readable text format without coordinates
    let text = `ReMindMap Export - ${new Date().toLocaleDateString()}\n\n`;
    nodes.forEach((node, index) => {
      text += `${index + 1}. ${node.title}\n`;
      text += `   Priority: ${node.priority}\n`;
      if (node.description) {
        text += `   Description: ${node.description}\n`;
      }
      if (node.dueDate) {
        text += `   Due Date: ${node.dueDate}\n`;
      }
      if (node.reminderEnabled) {
        text += `   Reminder: ${node.reminderTime} (${node.reminderRecurrence})\n`;
      }
      text += '\n';
    });

    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    }
    setShowExportMenu(false);
  };

  const importFromJSON = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = async (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          const text = await file.text();
          const data = JSON.parse(text);

          // Validate data structure
          if (!Array.isArray(data)) {
            throw new Error('Invalid format: Expected an array of nodes');
          }

          // Validate each node has required fields
          const validatedNodes = data.map((node, index) => {
            if (!node.id || !node.title) {
              throw new Error(`Invalid node at index ${index}: Missing id or title`);
            }

            // Generate random positions for imported nodes
            return {
              ...node,
              x: (Math.random() - 0.5) * 400,
              y: (Math.random() - 0.5) * 400,
              priority: node.priority || 'medium',
              color: node.color || '#3b82f6',
              description: node.description || '',
              dueDate: node.dueDate || ''
            };
          });

          // Add to IndexedDB
          for (const node of validatedNodes) {
            await addItem({
              title: node.title,
              priority: node.priority,
              color: node.color,
              description: node.description,
              dueDate: node.dueDate ? new Date(node.dueDate) : undefined,
              reminderEnabled: node.reminderEnabled,
              reminderTime: node.reminderTime,
              reminderRecurrence: node.reminderRecurrence
            });
          }

          setNodes([...nodes, ...validatedNodes]);
          alert(`Successfully imported ${validatedNodes.length} nodes!`);
        } catch (error) {
          if (error instanceof SyntaxError) {
            alert('Import failed: Invalid JSON format. Please check your file.');
          } else if (error instanceof Error) {
            alert(`Import failed: ${error.message}`);
          } else {
            alert('Import failed: Unknown error occurred');
          }
          console.error('Import error:', error);
        }
      };

      input.click();
      setShowExportMenu(false);
    } catch (error) {
      alert('Failed to open file picker');
      console.error('File picker error:', error);
    }
  };


  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
          background-attachment: fixed;
          color: #ffffff;
          overflow: hidden;
        }
      `}</style>

      {/* Loading Screen */}
      {isLoading && (
        <div className="loading-screen">
          <div className="loading-content">
            <div className="loading-logo">
              <span className="loading-icon">🧠</span>
              <h1 className="loading-title">ReMindMap</h1>
            </div>
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <p className="loading-text">Loading your mind map...</p>
          </div>
        </div>
      )}

      <div className="map-container" style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease' }}>
        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-logo" onClick={() => router.push('/')}>
            <span className="navbar-logo-icon">🧠</span>
            <span>ReMindMap</span>
          </div>
          <div className="navbar-controls">
            <span className={`mode-badge ${editMode ? '' : 'view'}`}>
              {editMode ? 'Edit Mode' : 'View Mode'}
            </span>
            <button className="btn" onClick={() => setEditMode(!editMode)}>
              {editMode ? '👁️ View Mode' : '✏️ Edit Mode'}
            </button>
            <div style={{ position: 'relative' }}>
              <button className="btn btn-secondary" onClick={() => setShowExportMenu(!showExportMenu)}>
                📥 Export
              </button>
              {showExportMenu && (
                <div className="export-menu">
                  <button className="export-option" onClick={exportAsCopyText}>
                    📋 Copy as Text
                  </button>
                  <button className="export-option" onClick={exportAsJSON}>
                    💾 Download JSON
                  </button>
                  <button className="export-option" onClick={importFromJSON}>
                    📤 Import JSON
                  </button>
                </div>
              )}
            </div>
            <button className="btn btn-secondary" onClick={() => setShowTips(true)}>
              💡 Help
            </button>
          </div>
        </nav>

        {/* Sidebar */}
        <div className="sidebar">
            <button className="sidebar-btn" onClick={handleAddNode} title="Add Node">
              ➕
              <div className="sidebar-tooltip">Add Node</div>
            </button>
            <button className="sidebar-btn" onClick={handleDeleteNode} title="Delete Node">
              🗑️
              <div className="sidebar-tooltip">Delete</div>
            </button>
            <div className="divider"></div>
            <button className="sidebar-btn" onClick={() => engineRef.current?.fit()} title="Fit to Screen">
              📐
              <div className="sidebar-tooltip">Fit Screen</div>
            </button>
            <button className="sidebar-btn" onClick={loadSampleMap} title="Load sample map" disabled={isSeeding}>
              ✨
              <div className="sidebar-tooltip">Sample map</div>
            </button>
            <button className="sidebar-btn" onClick={handleClearAll} title="Clear All">
              ⚡
              <div className="sidebar-tooltip">Clear All</div>
            </button>
        </div>

        {/* Main Canvas */}
        <div className="main-area">
          <div className="canvas-container" ref={containerRef}>
            <canvas ref={canvasRef} />
            {!isLoading && nodes.length === 0 && !isSeeding && (
              <div className="empty-state">
                <div className="empty-orb" />
                <h2>Start your mind map</h2>
                <p>Add your first thought, or watch a sample map build itself.</p>
                <div className="empty-actions">
                  <button className="btn" onClick={loadSampleMap}>✨ Load sample map</button>
                  <button className="btn btn-secondary" onClick={handleAddNode}>＋ Add a node</button>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel - Show Insights or Edit Panel */}
          {showRightPanel && (
            <div className="side-panel open">
            {isPanelOpen ? (
              // Edit Panel
              <>
                <div className="panel-header">
                  <h3>Edit Node</h3>
                  <button className="panel-close" onClick={() => setIsPanelOpen(false)}>✕</button>
                </div>
                <div className="panel-content">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter title..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Color</label>
                <div className="color-picker">
                  {['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1'].map(color => (
                    <div
                      key={color}
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add notes..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              {/* Reminder Section */}
              <div className="form-section">
                <div className="section-header-form">
                  <span className="section-icon">🔔</span>
                  <span className="section-title">Recurring Reminders</span>
                </div>

                <div className="form-group">
                  <label className="form-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.reminderEnabled}
                      onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                    />
                    <span>Enable Reminders</span>
                  </label>
                </div>

                {formData.reminderEnabled && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Reminder Time</label>
                      <input
                        type="time"
                        className="form-input"
                        value={formData.reminderTime}
                        onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Recurrence</label>
                      <select
                        className="form-select"
                        value={formData.reminderRecurrence}
                        onChange={(e) => setFormData({ ...formData, reminderRecurrence: e.target.value as any })}
                      >
                        <option value="none">Once</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="btn-group">
                <button className="btn" onClick={handleSaveNode}>Save</button>
                <button className="btn btn-secondary" onClick={() => setIsPanelOpen(false)}>Cancel</button>
              </div>
                </div>
              </>
            ) : (
              // Insights Panel
              <>
                <div className="panel-header">
                  <h3>📊 Insights & Stats</h3>
                  <button className="panel-close" onClick={() => setShowMapStats(true)}>📈</button>
                </div>
                <div className="panel-content">
                  <div className="insight-section">
                    <div className="insight-header">💡 Map Insights</div>
                    <div className="insight-item">
                      <div className="insight-label">Central Thought</div>
                      <div className="insight-value">{getInsights().mostConnected}</div>
                    </div>
                    <div className="insight-item">
                      <div className="insight-label">Color Clusters</div>
                      <div className="insight-value">{getInsights().clusters}</div>
                    </div>
                    <div className="insight-item">
                      <div className="insight-label">Suggested Action</div>
                      <div className="insight-value">{getInsights().suggestion}</div>
                    </div>
                  </div>

                  <div className="insight-section">
                    <div className="insight-header">📅 Session Stats</div>
                    <div className="insight-item">
                      <div className="insight-label">Total Nodes</div>
                      <div className="insight-value">{nodes.length}</div>
                    </div>
                    <div className="insight-item">
                      <div className="insight-label">Session Duration</div>
                      <div className="insight-value">{getSessionDuration()}</div>
                    </div>
                    <div className="insight-item">
                      <div className="insight-label">Nodes Added</div>
                      <div className="insight-value">{sessionNodesAdded}</div>
                    </div>
                    <div className="insight-item">
                      <div className="insight-label">Nodes Removed</div>
                      <div className="insight-value">{sessionNodesRemoved}</div>
                    </div>
                  </div>

                  <div className="insight-tip">
                    💡 Click any node to edit it
                  </div>
                </div>
              </>
            )}
          </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="bottom-control-bar">
          {/* Zoom Controls */}
          <div className="zoom-controls">
            <button className="zoom-btn" onClick={() => setZoom(Math.min(3, zoom + 0.1))}>+</button>
            <div className="zoom-display">{Math.round(zoom * 100)}%</div>
            <button className="zoom-btn" onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}>−</button>
          </div>

          {/* Stats */}
          <div className="bottom-stats">
            <div className="stat-item">
              <span>Nodes:</span>
              <span className="stat-value">{nodes.length}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span>Selected:</span>
              <span className="stat-value">{selectedNode ? `1` : '0'}</span>
            </div>
          </div>
        </div>

        {/* Quick add */}
        {showQuickAdd && (
          <div className="quick-add-overlay" onClick={() => setShowQuickAdd(false)}>
            <form
              className="quick-add"
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => { e.preventDefault(); submitQuickAdd(); }}
            >
              <div className="quick-add-header">
                <span>New thought</span>
                <kbd>Enter</kbd>
              </div>
              <input
                autoFocus
                value={quickAdd.title}
                onChange={(e) => setQuickAdd({ ...quickAdd, title: e.target.value })}
                onKeyDown={(e) => e.key === 'Escape' && setShowQuickAdd(false)}
                placeholder={selectedNode ? `Branch off “${nodes.find(n => n.id === selectedNode)?.title ?? ''}”…` : 'What’s on your mind?'}
              />
              <div className="quick-add-row">
                <div className="swatches">
                  {['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#14b8a6'].map(c => (
                    <button
                      type="button"
                      key={c}
                      className={`swatch ${quickAdd.color === c ? 'active' : ''}`}
                      style={{ background: c }}
                      onClick={() => setQuickAdd({ ...quickAdd, color: c })}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
                <div className="priorities">
                  {(['low', 'medium', 'high', 'urgent'] as const).map(p => (
                    <button
                      type="button"
                      key={p}
                      className={`priority-chip ${quickAdd.priority === p ? 'active' : ''}`}
                      onClick={() => setQuickAdd({ ...quickAdd, priority: p })}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn quick-add-submit" disabled={!quickAdd.title.trim()}>Add to map</button>
            </form>
          </div>
        )}

        {/* Tips & Instructions */}
        {showTips && (
          <div className="tips-overlay">
            <div className="tips-card">
              <button className="tips-close" onClick={handleDismissTips}>✕</button>
              <h3 className="tips-title">💡 Quick Tips</h3>
              <div className="tips-content">
                <div className="tip-item">
                  <span className="tip-icon">➕</span>
                  <p><strong>Add Nodes:</strong> Click the + button in the sidebar to create new nodes</p>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">👆</span>
                  <p><strong>Select & Edit:</strong> Click any node to open the edit panel and customize it</p>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🔍</span>
                  <p><strong>Zoom & Navigate:</strong> Use mouse wheel to zoom, click + drag to pan around</p>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🔔</span>
                  <p><strong>Set Reminders:</strong> Enable recurring reminders for any node in the edit panel</p>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">📥</span>
                  <p><strong>Export:</strong> Save your map as text or JSON without coordinates</p>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">⌨️</span>
                  <p><strong>Shortcuts:</strong> N = New Node | S = Export | I = Stats</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Stats Modal */}
        {showMapStats && (
          <div className="tips-overlay" onClick={() => setShowMapStats(false)}>
            <div className="tips-card" onClick={(e) => e.stopPropagation()}>
              <button className="tips-close" onClick={() => setShowMapStats(false)}>✕</button>
              <h3 className="tips-title">📈 Detailed Map Statistics</h3>
              <div className="tips-content">
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-box-value">{nodes.length}</div>
                    <div className="stat-box-label">Total Nodes</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-box-value">{getInsights().clusters}</div>
                    <div className="stat-box-label">Clusters</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-box-value">{sessionNodesAdded}</div>
                    <div className="stat-box-label">Added</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-box-value">{sessionNodesRemoved}</div>
                    <div className="stat-box-label">Removed</div>
                  </div>
                </div>
                <div className="stats-section">
                  <div className="stats-row">
                    <span className="stats-label">Session Duration:</span>
                    <span className="stats-value">{getSessionDuration()}</span>
                  </div>
                  <div className="stats-row">
                    <span className="stats-label">Most Central Node:</span>
                    <span className="stats-value">{getInsights().mostConnected}</span>
                  </div>
                  <div className="stats-row">
                    <span className="stats-label">Nodes with Reminders:</span>
                    <span className="stats-value">{nodes.filter(n => n.reminderEnabled).length}</span>
                  </div>
                  <div className="stats-row">
                    <span className="stats-label">Nodes with Due Dates:</span>
                    <span className="stats-value">{nodes.filter(n => n.dueDate).length}</span>
                  </div>
                  <div className="stats-row">
                    <span className="stats-label">High Priority Nodes:</span>
                    <span className="stats-value">{nodes.filter(n => n.priority === 'high' || n.priority === 'urgent').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .map-container {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        /* Loading Screen */
        .loading-screen {
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .loading-logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          animation: fadeInUp 0.6s ease;
        }

        .loading-icon {
          font-size: 4rem;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        .loading-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 3rem;
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff 0%, #60a5fa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          animation: fadeInScale 0.5s ease 0.3s both;
        }

        .spinner {
          width: 100%;
          height: 100%;
          border: 4px solid rgba(59, 130, 246, 0.1);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading-text {
          font-size: 1.1rem;
          color: #94a3b8;
          font-weight: 500;
          animation: fadeInUp 0.6s ease 0.4s both;
        }

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 70px;
          background: rgba(10, 14, 39, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
          z-index: 100;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .sidebar-toggle-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #60a5fa;
          font-size: 1rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }

        .sidebar-toggle-btn:hover {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.3);
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
        }

        .sidebar-toggle-btn:active {
          transform: scale(0.95);
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.3rem;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          color: #ffffff;
          cursor: pointer;
        }

        .navbar-logo-icon {
          font-size: 1.75rem;
        }

        .navbar-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .mode-badge {
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.5);
          color: #10b981;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .mode-badge.view {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.5);
          color: #3b82f6;
        }

        .btn {
          background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
          color: white;
          border: none;
          padding: 0.65rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          user-select: none;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }

        .btn:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #e5e5e5;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .btn-secondary:active {
          transform: scale(0.97);
        }

        .sidebar {
          position: fixed;
          left: 0;
          top: 70px;
          width: 80px;
          height: calc(100vh - 70px);
          background: linear-gradient(180deg, rgba(10, 14, 39, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem 0;
          gap: 1rem;
          overflow-y: auto;
          z-index: 90;
          transform: translateX(0);
          opacity: 1;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
          animation: slideInFromLeft 0.3s ease-out;
        }

        @keyframes slideInFromLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .sidebar-btn {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #60a5fa;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          position: relative;
          user-select: none;
        }

        .sidebar-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.3);
          transform: scale(1.05);
        }

        .sidebar-btn:active {
          transform: scale(0.95);
          background: rgba(59, 130, 246, 0.25);
        }

        .sidebar-tooltip {
          position: absolute;
          left: 70px;
          background: rgba(30, 41, 59, 0.95);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #60a5fa;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }

        .sidebar-btn:hover .sidebar-tooltip {
          opacity: 1;
        }

        .divider {
          width: 30px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
          margin: 0.5rem 0;
        }

        .main-area {
          position: fixed;
          top: 70px;
          left: 80px;
          right: 0;
          bottom: 0;
          display: flex;
        }

        .empty-state {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          pointer-events: none;
          animation: fadeInUp 0.6s ease;
        }
        .empty-state h2 {
          margin-top: 28px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 28px;
          color: #f1f5f9;
        }
        .empty-state p {
          margin-top: 8px;
          color: #94a3b8;
          font-size: 15px;
        }
        .empty-actions {
          margin-top: 24px;
          display: flex;
          gap: 12px;
          pointer-events: auto;
        }
        .empty-orb {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #ffffff 0%, #60a5fa 18%, #3b82f6 55%, #1e3a8a 100%);
          box-shadow: 0 0 60px rgba(59, 130, 246, 0.55), 0 0 140px rgba(139, 92, 246, 0.35);
          animation: orbFloat 4s ease-in-out infinite;
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.04); }
        }
        .quick-add-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 18vh;
          background: rgba(2, 6, 23, 0.55);
          backdrop-filter: blur(6px);
          animation: fadeIn 0.2s ease;
        }
        .quick-add {
          width: min(520px, calc(100vw - 32px));
          background: rgba(15, 23, 42, 0.92);
          border: 1px solid rgba(96, 165, 250, 0.3);
          border-radius: 18px;
          padding: 18px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
          animation: quickIn 0.28s cubic-bezier(0.2, 0.9, 0.3, 1.2);
        }
        @keyframes quickIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to { opacity: 1; transform: none; }
        }
        .quick-add-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #94a3b8;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .quick-add-header kbd {
          font-family: inherit;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid rgba(148, 163, 184, 0.3);
          text-transform: none;
          letter-spacing: 0;
        }
        .quick-add input {
          width: 100%;
          margin-top: 12px;
          background: transparent;
          border: none;
          outline: none;
          color: #f8fafc;
          font-size: 22px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
        }
        .quick-add input::placeholder {
          color: #475569;
        }
        .quick-add-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 16px;
          flex-wrap: wrap;
        }
        .swatches, .priorities {
          display: flex;
          gap: 8px;
        }
        .swatch {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .swatch:hover { transform: scale(1.15); }
        .swatch.active {
          border-color: #ffffff;
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
        }
        .priority-chip {
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.25);
          background: transparent;
          color: #94a3b8;
          font-size: 12px;
          text-transform: capitalize;
          cursor: pointer;
        }
        .priority-chip.active {
          background: rgba(59, 130, 246, 0.2);
          border-color: #60a5fa;
          color: #e2e8f0;
        }
        .quick-add-submit {
          width: 100%;
          margin-top: 16px;
        }
        .quick-add-submit:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .canvas-container {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(79, 70, 229, 0.05) 0%, transparent 50%);
        }

        canvas {
          display: block;
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          cursor: grab;
          touch-action: none;
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-font-smoothing: subpixel-antialiased;
        }

        .side-panel {
          width: 350px;
          background: rgba(30, 41, 59, 0.95);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          overflow-y: auto;
          transform: translateX(0);
          transition: all 0.3s ease;
          z-index: 50;
        }

        .panel-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .panel-header h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.1rem;
          color: #ffffff;
        }

        .panel-close {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 1.5rem;
          transition: color 0.3s ease;
        }

        .panel-close:hover {
          color: #60a5fa;
        }

        .panel-content {
          padding: 1.5rem;
        }

        .insight-section {
          margin-bottom: 2rem;
        }

        .insight-header {
          font-size: 1rem;
          font-weight: 600;
          color: #60a5fa;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .insight-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .insight-label {
          font-size: 0.9rem;
          color: #94a3b8;
        }

        .insight-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: #e5e5e5;
          text-align: right;
          max-width: 60%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .insight-tip {
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          color: #94a3b8;
          font-size: 0.9rem;
          text-align: center;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-section {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .section-header-form {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .section-icon {
          font-size: 1.25rem;
        }

        .section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #60a5fa;
        }

        .form-checkbox {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          color: #e5e5e5;
          font-size: 0.95rem;
        }

        .form-checkbox input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #3b82f6;
        }

        .form-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          resize: none;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .color-picker {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }

        .color-option {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 10px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .color-option.selected {
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 0 2px #0a0e27, 0 0 10px currentColor;
        }

        .btn-group {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .btn-group .btn {
          flex: 1;
          justify-content: center;
        }

        .bottom-control-bar {
          position: fixed;
          bottom: 2rem;
          left: calc(80px + 1rem);
          display: flex;
          align-items: center;
          gap: 1rem;
          z-index: 40;
        }

        .bottom-stats {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(30, 41, 59, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          padding: 0.75rem 1.25rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #94a3b8;
          white-space: nowrap;
        }

        .stat-divider {
          width: 1px;
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
        }

        .stat-value {
          font-weight: 600;
          color: #60a5fa;
          font-family: 'Space Grotesk', sans-serif;
        }

        .zoom-controls {
          display: flex;
          gap: 0.5rem;
          background: rgba(30, 41, 59, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          padding: 0.5rem;
        }

        .zoom-btn {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #60a5fa;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          user-select: none;
        }

        .zoom-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .zoom-btn:active {
          transform: scale(0.9);
          background: rgba(59, 130, 246, 0.3);
        }

        .zoom-display {
          padding: 0.5rem 0.75rem;
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          min-width: 50px;
          justify-content: center;
        }

        /* Export Menu */
        .export-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          background: rgba(30, 41, 59, 0.98);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          min-width: 180px;
          overflow: hidden;
          z-index: 1000;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .export-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.875rem 1.25rem;
          background: transparent;
          border: none;
          color: #e5e5e5;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .export-option:last-child {
          border-bottom: none;
        }

        .export-option:hover {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
        }

        /* Tips Overlay */
        .tips-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(10, 14, 39, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .tips-card {
          position: relative;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 24px;
          backdrop-filter: blur(20px);
          padding: 2.5rem;
          max-width: 600px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
          animation: scaleIn 0.3s ease;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .tips-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          width: 36px;
          height: 36px;
          color: #94a3b8;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tips-close:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.5);
          color: #ef4444;
          transform: rotate(90deg);
        }

        .tips-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.75rem;
          color: #ffffff;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .tips-content {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .tip-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .tip-item:hover {
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.2);
          transform: translateX(4px);
        }

        .tip-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
          line-height: 1;
        }

        .tip-item p {
          margin: 0;
          color: #e5e5e5;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .tip-item strong {
          color: #60a5fa;
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-box {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .stat-box-value {
          font-size: 2rem;
          font-weight: 700;
          color: #60a5fa;
          margin-bottom: 0.5rem;
        }

        .stat-box-label {
          font-size: 0.9rem;
          color: #94a3b8;
        }

        .stats-section {
          margin-top: 1.5rem;
        }

        .stats-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .stats-label {
          color: #94a3b8;
          font-size: 0.95rem;
        }

        .stats-value {
          color: #e5e5e5;
          font-weight: 600;
          font-size: 0.95rem;
        }

        @media (max-width: 1024px) {
          .side-panel {
            width: 300px;
          }

          .sidebar {
            width: 70px;
          }

          .main-area {
            left: 70px;
          }

          .bottom-control-bar {
            left: calc(70px + 1rem);
          }
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 0 1rem;
          }

          .sidebar {
            width: 60px;
          }

          .main-area {
            left: 60px;
          }

          .side-panel {
            width: 100%;
            position: fixed;
            right: 0;
            top: 70px;
            bottom: 0;
          }

          .bottom-control-bar {
            left: calc(60px + 0.75rem);
            bottom: 1rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .bottom-stats {
            font-size: 0.75rem;
          }

          .tips-card {
            padding: 2rem 1.5rem;
            max-width: 95%;
          }

          .tips-title {
            font-size: 1.5rem;
          }

          .tip-item {
            padding: 0.875rem;
          }

          .tip-item p {
            font-size: 0.875rem;
          }

          .export-menu {
            min-width: 160px;
          }

          .export-option {
            padding: 0.75rem 1rem;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </>
  );
}
