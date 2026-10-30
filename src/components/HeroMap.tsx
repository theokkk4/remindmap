'use client';

import { useEffect, useRef } from 'react';
import { MapEngine } from '@/lib/mapEngine';
import { SAMPLE_MAP } from '@/lib/sampleMap';

/**
 * The real map engine, building the sample map node by node and looping,
 * so the landing page shows the product itself rather than a mockup.
 */
export default function HeroMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new MapEngine(canvas, { onSelect: () => {}, onMove: () => {}, onZoom: () => {} });
    engine.setEditable(false);
    engine.bottomInset = 0;

    const nodes = SAMPLE_MAP.map((n, i) => ({ id: `hero-${i}`, ...n }));
    let shown = 0;
    let timer = 0;
    let cancelled = false;

    const step = () => {
      if (cancelled) return;
      if (shown < nodes.length) {
        shown += 1;
        engine.setNodes(nodes.slice(0, shown));
        if (shown === 1) engine.fit(false);
        else if (shown % 3 === 0 || shown === nodes.length) engine.fit();
        timer = window.setTimeout(step, 420);
      } else {
        // Hold the finished map, then rebuild it.
        timer = window.setTimeout(() => {
          shown = 0;
          engine.setNodes([]);
          timer = window.setTimeout(step, 700);
        }, 6500);
      }
    };
    timer = window.setTimeout(step, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      engine.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />;
}
