'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import dynamic from 'next/dynamic';
import type { Item, GraphData, GraphNode, GraphLink } from '@/lib/types';
import { motion } from 'framer-motion';
import { generateSmartConnections, detectCluster, getClusterIcon } from '@/lib/ai/clustering';

// Dynamic import to prevent SSR issues with canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d').then(mod => mod.default || mod), {
  ssr: false,
  loading: () => (
    <div className="glass-card p-12 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse" />
        <p className="text-white">Loading graph...</p>
      </div>
    </div>
  ),
});

interface GraphCanvasProps {
  items: Item[];
  onNodeClick?: (node: GraphNode) => void;
  onNodeRightClick?: (node: GraphNode, event: any) => void;
  editMode?: boolean;
}

const GraphCanvas = forwardRef<any, GraphCanvasProps>(({ items, onNodeClick, onNodeRightClick, editMode = false }, ref) => {
  const internalGraphRef = useRef<any>(null);
  
  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    zoom: (scale: number, duration: number) => {
      if (internalGraphRef.current) {
        const currentZoom = internalGraphRef.current.zoom();
        internalGraphRef.current.zoom(currentZoom * scale, duration);
      }
    },
    zoomToFit: (duration: number, padding: number) => {
      internalGraphRef.current?.zoomToFit(duration, padding);
    },
  }));
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle responsive sizing - optimized for desktop/iPad landscape
  useEffect(() => {
    const updateDimensions = () => {
      // For landscape/desktop, use more of the available space
      const padding = window.innerWidth >= 1024 ? 48 : 32;
      const width = window.innerWidth - padding;
      const height = window.innerHeight - 320; // Account for header, toolbar, status bar
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Transform items into graph data with AI-powered connections
  useEffect(() => {
    const nodes: GraphNode[] = items.map(item => {
      // AI: Detect cluster for visual grouping
      const cluster = detectCluster(item.title, item.description);
      
      return {
        id: item.id,
        name: item.title,
        description: item.description,
        dueDate: item.dueDate,
        priority: item.priority,
        completed: item.completed,
        val: 16,
        color: item.color || '#3b82f6',
        cluster: cluster.cluster, // AI-detected cluster
        clusterIcon: getClusterIcon(cluster.cluster),
      };
    });

    // AI: Generate smart connections based on content similarity
    const smartConnections = generateSmartConnections(items);
    
    const links: GraphLink[] = smartConnections.map(conn => ({
      source: conn.source,
      target: conn.target,
      color: `rgba(56, 189, 248, ${conn.strength * 0.5})`, // Opacity based on relationship strength
      label: conn.strength > 0.5 ? 'Strongly related' : undefined,
    }));

    // Add visual cluster grouping (priority-based backup)
    const urgentNodes = nodes.filter(n => n.priority === 'urgent');
    const highNodes = nodes.filter(n => n.priority === 'high');

    // Connect within priority groups (lighter, secondary connections)
    urgentNodes.forEach((node, i) => {
      if (i < urgentNodes.length - 1) {
        links.push({
          source: node.id,
          target: urgentNodes[i + 1].id,
          color: 'rgba(239, 68, 68, 0.15)',
        });
      }
    });

    highNodes.forEach((node, i) => {
      if (i < highNodes.length - 1) {
        links.push({
          source: node.id,
          target: highNodes[i + 1].id,
          color: 'rgba(245, 158, 11, 0.15)',
        });
      }
    });

    setGraphData({ nodes, links });
  }, [items]);

  // Gentle zoom animation on mount
  useEffect(() => {
    if (internalGraphRef.current) {
      setTimeout(() => {
        internalGraphRef.current?.zoomToFit(400, 80);
      }, 500);
    }
  }, [graphData]);

  const handleNodeClick = useCallback((node: any) => {
    if (onNodeClick) {
      onNodeClick(node as GraphNode);
    }
  }, [onNodeClick]);

  const handleNodeRightClick = useCallback((node: any, event: any) => {
    if (onNodeRightClick) {
      onNodeRightClick(node as GraphNode, event);
    }
  }, [onNodeRightClick]);

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass rounded-2xl p-12 text-center"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <p className="text-slate-400 text-lg font-inter">
          No items yet. Your mind map awaits...
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        willChange: 'transform'
      }}
    >
      <ForceGraph2D
        ref={internalGraphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="transparent"
        nodeLabel="name"
        nodeAutoColorBy="cluster"
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          // Safety check: ensure node has valid position
          if (!node || typeof node.x !== 'number' || typeof node.y !== 'number' || 
              !isFinite(node.x) || !isFinite(node.y)) {
            return;
          }

          const label = node.name;
          const fontSize = 15 / globalScale;
          const nodeSize = node.val || 18;

          // Lucidchart-style: Clean rounded rectangles optimized for desktop/iPad
          const width = Math.max(label.length * 8, nodeSize * 3.5);
          const height = nodeSize * 2.8;
          const radius = 10;
          const x = node.x - width / 2;
          const y = node.y - height / 2;
          
          // Modern glass morphism shadow
          ctx.shadowBlur = 12;
          ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;
          
          // Draw rounded rectangle with modern styling
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + width - radius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
          ctx.lineTo(x + width, y + height - radius);
          ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          ctx.lineTo(x + radius, y + height);
          ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          
          // Modern gradient fill
          const gradient = ctx.createLinearGradient(x, y, x, y + height);
          const baseColor = node.color || '#3b82f6';
          gradient.addColorStop(0, baseColor);
          gradient.addColorStop(1, baseColor + '80');
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Modern border with glow
          ctx.shadowBlur = 0;
          ctx.strokeStyle = editMode ? '#60a5fa' : 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = editMode ? 2 : 1;
          ctx.stroke();

          // Text inside box (Lucidchart style - always visible)
          ctx.shadowBlur = 0;
          ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#ffffff';
          
          // Truncate long text
          const maxWidth = width - 16;
          let displayText = label;
          if (ctx.measureText(label).width > maxWidth) {
            while (ctx.measureText(displayText + '...').width > maxWidth && displayText.length > 0) {
              displayText = displayText.slice(0, -1);
            }
            displayText += '...';
          }
          
          ctx.fillText(displayText, node.x, node.y);
          
          // Priority badge (top-right corner)
          if (node.priority && globalScale > 1) {
            const badgeSize = 6;
            const badgeX = x + width - 8;
            const badgeY = y + 8;
            
            ctx.beginPath();
            ctx.arc(badgeX, badgeY, badgeSize, 0, 2 * Math.PI);
            
            // Priority color
            const priorityColors: Record<string, string> = {
              urgent: '#ef4444',
              high: '#f59e0b',
              medium: '#3b82f6',
              low: '#6b7280'
            };
            ctx.fillStyle = priorityColors[node.priority] || '#6b7280';
            ctx.fill();
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }}
        linkColor={(link: any) => link.color || 'rgba(100, 150, 200, 0.25)'}
        linkWidth={1.5}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.005}
        linkCurvature={0.15}
        onNodeClick={handleNodeClick}
        onNodeRightClick={handleNodeRightClick}
        cooldownTicks={30}
        d3AlphaDecay={0.05}
        d3VelocityDecay={0.4}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        warmupTicks={10}
        cooldownTime={2000}
      />
    </motion.div>
  );
});

GraphCanvas.displayName = 'GraphCanvas';

export default GraphCanvas;
