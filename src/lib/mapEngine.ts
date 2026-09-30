// Animated canvas renderer for the mind map: spring physics, soft collisions,
// animated links, camera easing and pointer interaction. The React page owns
// the data; the engine owns everything that moves.

export interface EngineNode {
  id: string;
  x: number;
  y: number;
  title: string;
  color: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reminderEnabled?: boolean;
  dueDate?: string;
}

interface SimNode {
  data: EngineNode;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  parent: string | null;
  born: number;
  dying: number | null;
  hover: number;
  phase: number;
}

interface Particle {
  edge: string;
  t: number;
  speed: number;
}

interface Ripple {
  x: number;
  y: number;
  born: number;
  color: string;
}

export interface EngineCallbacks {
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onZoom: (zoom: number) => void;
}

const RADIUS = { low: 30, medium: 34, high: 38, urgent: 42 } as const;
const MIN_ZOOM = 0.3;
/** Root nodes (no parent) are drawn larger so the central idea stands out. */
const rad = (n: SimNode) => RADIUS[n.data.priority] + (n.parent ? 0 : 12);
const MAX_ZOOM = 3;

const easeOutBack = (t: number) => {
  const c1 = 1.9;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
const rgba = (hex: string, a: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};

/** Soft radial glow rendered once per color and reused every frame. */
const spriteCache = new Map<string, HTMLCanvasElement>();
function glowSprite(color: string, core: string | null, alpha: number) {
  const key = `${color}|${core}|${alpha}`;
  let c = spriteCache.get(key);
  if (!c) {
    c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    if (core) {
      grad.addColorStop(0, rgba(core, 0.95));
      grad.addColorStop(0.2, rgba(color, 0.6));
    } else {
      grad.addColorStop(0, rgba(color, alpha));
      grad.addColorStop(0.3, rgba(color, alpha));
    }
    grad.addColorStop(1, rgba(color, 0));
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    spriteCache.set(key, c);
  }
  return c;
}

export class MapEngine {
  private ctx: CanvasRenderingContext2D;
  private nodes = new Map<string, SimNode>();
  private order: string[] = [];
  private particles: Particle[] = [];
  private ripples: Ripple[] = [];
  private selected: string | null = null;
  private hovered: string | null = null;
  private raf = 0;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private cam = { x: 0, y: 0, zoom: 1 };
  private camTarget = { x: 0, y: 0, zoom: 1 };
  private drag: { mode: 'pan' | 'node'; id?: string; sx: number; sy: number; moved: boolean; cx: number; cy: number } | null = null;
  private resizeObserver: ResizeObserver;
  private firstSync = true;
  private start = performance.now();

  constructor(private canvas: HTMLCanvasElement, private cb: EngineCallbacks) {
    this.ctx = canvas.getContext('2d')!;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas.parentElement ?? canvas);
    this.resize();
    canvas.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMovePointer);
    window.addEventListener('pointerup', this.onUp);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    this.raf = requestAnimationFrame(this.frame);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.canvas.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMovePointer);
    window.removeEventListener('pointerup', this.onUp);
    this.canvas.removeEventListener('wheel', this.onWheel);
  }

  /* ---------- Data sync ---------- */

  setNodes(list: EngineNode[]) {
    const now = performance.now();
    const ids = new Set(list.map((n) => n.id));

    for (const [id, s] of this.nodes) {
      if (!ids.has(id) && s.dying === null) s.dying = now;
    }

    list.forEach((n, i) => {
      const existing = this.nodes.get(n.id);
      if (existing) {
        existing.data = n;
        if (!this.drag || this.drag.id !== n.id) {
          existing.tx = n.x;
          existing.ty = n.y;
        }
        return;
      }
      // Link to the nearest node that already exists.
      let parent: string | null = null;
      let best = Infinity;
      for (const id of this.order) {
        const o = this.nodes.get(id);
        if (!o || o.dying !== null) continue;
        const d = Math.hypot(o.tx - n.x, o.ty - n.y);
        if (d < best) {
          best = d;
          parent = id;
        }
      }
      const origin = parent ? this.nodes.get(parent)! : null;
      const stagger = this.firstSync ? i * 70 : 0;
      this.nodes.set(n.id, {
        data: n,
        x: origin ? origin.x : n.x * 0.2,
        y: origin ? origin.y : n.y * 0.2,
        vx: 0,
        vy: 0,
        tx: n.x,
        ty: n.y,
        parent,
        born: now + stagger,
        dying: null,
        hover: 0,
        phase: Math.random() * Math.PI * 2,
      });
      this.order.push(n.id);
      if (parent) {
        for (let k = 0; k < 2; k++) this.particles.push({ edge: n.id, t: Math.random(), speed: 0.12 + Math.random() * 0.12 });
      }
      if (!this.firstSync) this.ripples.push({ x: n.x, y: n.y, born: now, color: n.color });
    });

    if (this.firstSync && list.length) {
      this.firstSync = false;
      this.fit(false);
    } else if (this.firstSync) {
      this.firstSync = false;
    }
  }

  setSelected(id: string | null) {
    this.selected = id;
  }

  setZoom(z: number) {
    if (Math.abs(z - this.camTarget.zoom) > 0.001) this.camTarget.zoom = clamp(z, MIN_ZOOM, MAX_ZOOM);
  }

  /** Glide the camera so every node is visible. */
  fit(animate = true) {
    const live = [...this.nodes.values()].filter((n) => n.dying === null);
    if (!live.length) {
      Object.assign(this.camTarget, { x: 0, y: 0, zoom: 1 });
    } else {
      const xs = live.map((n) => n.tx);
      const ys = live.map((n) => n.ty);
      const minX = Math.min(...xs) - 90;
      const maxX = Math.max(...xs) + 90;
      const minY = Math.min(...ys) - 90;
      const maxY = Math.max(...ys) + 90;
      const bottomUi = 110; // zoom and stats controls overlay the bottom of the canvas
      const zoom = clamp(Math.min(this.width / (maxX - minX), (this.height - bottomUi) / (maxY - minY)), MIN_ZOOM, 1.4);
      Object.assign(this.camTarget, { x: (minX + maxX) / 2, y: (minY + maxY) / 2 + bottomUi / 2 / zoom, zoom });
    }
    if (!animate) Object.assign(this.cam, this.camTarget);
    this.cb.onZoom(this.camTarget.zoom);
  }

  /** Position for a new node next to `nearId` (or the map centre), away from others. */
  suggestPosition(nearId?: string | null) {
    const near = nearId ? this.nodes.get(nearId) : null;
    const cx = near ? near.tx : this.camTarget.x;
    const cy = near ? near.ty : this.camTarget.y;
    const base = near && near.parent ? Math.atan2(near.ty - (this.nodes.get(near.parent)?.ty ?? 0), near.tx - (this.nodes.get(near.parent)?.tx ?? 0)) : -Math.PI / 2;
    let bestPos = { x: cx + 180, y: cy };
    let bestScore = -Infinity;
    for (let i = 0; i < 16; i++) {
      const a = base + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * (Math.PI / 8);
      const p = { x: cx + Math.cos(a) * 180, y: cy + Math.sin(a) * 180 };
      let nearest = Infinity;
      for (const n of this.nodes.values()) nearest = Math.min(nearest, Math.hypot(n.tx - p.x, n.ty - p.y));
      const score = Math.min(nearest, 260) - i * 2;
      if (score > bestScore) {
        bestScore = score;
        bestPos = p;
      }
    }
    return { x: Math.round(bestPos.x), y: Math.round(bestPos.y) };
  }

  /* ---------- Coordinates ---------- */

  private resize() {
    const el = this.canvas.parentElement ?? this.canvas;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = el.clientWidth;
    this.height = el.clientHeight;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
  }

  private toScreen(x: number, y: number) {
    return { x: (x - this.cam.x) * this.cam.zoom + this.width / 2, y: (y - this.cam.y) * this.cam.zoom + this.height / 2 };
  }

  private toWorld(sx: number, sy: number) {
    return { x: (sx - this.width / 2) / this.cam.zoom + this.cam.x, y: (sy - this.height / 2) / this.cam.zoom + this.cam.y };
  }

  private local(e: PointerEvent | WheelEvent) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private hit(sx: number, sy: number) {
    const w = this.toWorld(sx, sy);
    for (let i = this.order.length - 1; i >= 0; i--) {
      const n = this.nodes.get(this.order[i]);
      if (!n || n.dying !== null) continue;
      if (Math.hypot(w.x - n.x, w.y - n.y) < rad(n) * 1.05) return n.data.id;
    }
    return null;
  }

  /* ---------- Input ---------- */

  private onDown = (e: PointerEvent) => {
    const p = this.local(e);
    const id = this.hit(p.x, p.y);
    this.drag = { mode: id ? 'node' : 'pan', id: id ?? undefined, sx: p.x, sy: p.y, moved: false, cx: this.camTarget.x, cy: this.camTarget.y };
    this.canvas.setPointerCapture?.(e.pointerId);
  };

  private onMovePointer = (e: PointerEvent) => {
    const p = this.local(e);
    if (!this.drag) {
      const h = this.hit(p.x, p.y);
      if (h !== this.hovered) {
        this.hovered = h;
        this.canvas.style.cursor = h ? 'pointer' : 'grab';
      }
      return;
    }
    const dx = p.x - this.drag.sx;
    const dy = p.y - this.drag.sy;
    if (!this.drag.moved && Math.hypot(dx, dy) < 4) return;
    this.drag.moved = true;
    this.canvas.style.cursor = 'grabbing';
    if (this.drag.mode === 'pan') {
      this.camTarget.x = this.drag.cx - dx / this.cam.zoom;
      this.camTarget.y = this.drag.cy - dy / this.cam.zoom;
      this.cam.x = this.camTarget.x;
      this.cam.y = this.camTarget.y;
    } else if (this.drag.id) {
      const n = this.nodes.get(this.drag.id);
      const w = this.toWorld(p.x, p.y);
      if (n) {
        n.tx = w.x;
        n.ty = w.y;
      }
    }
  };

  private onUp = (e: PointerEvent) => {
    if (!this.drag) return;
    const d = this.drag;
    this.drag = null;
    this.canvas.style.cursor = this.hovered ? 'pointer' : 'grab';
    if (d.moved) {
      if (d.mode === 'node' && d.id) {
        const n = this.nodes.get(d.id);
        if (n) this.cb.onMove(d.id, Math.round(n.tx), Math.round(n.ty));
      }
      return;
    }
    const p = this.local(e);
    const w = this.toWorld(p.x, p.y);
    if (d.mode === 'node' && d.id) {
      const n = this.nodes.get(d.id)!;
      this.ripples.push({ x: n.x, y: n.y, born: performance.now(), color: n.data.color });
      this.cb.onSelect(d.id);
    } else {
      this.ripples.push({ x: w.x, y: w.y, born: performance.now(), color: '#60a5fa' });
      this.cb.onSelect(null);
    }
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const p = this.local(e);
    const before = this.toWorld(p.x, p.y);
    const zoom = clamp(this.camTarget.zoom * Math.exp(-e.deltaY * 0.0015), MIN_ZOOM, MAX_ZOOM);
    // Keep the point under the cursor fixed.
    this.camTarget.zoom = zoom;
    this.camTarget.x = before.x - (p.x - this.width / 2) / zoom;
    this.camTarget.y = before.y - (p.y - this.height / 2) / zoom;
    this.cb.onZoom(zoom);
  };

  /* ---------- Simulation & drawing ---------- */

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame);
    this.step(now);
    this.draw(now);
  };

  private step(now: number) {
    // Camera easing.
    const k = 0.14;
    this.cam.zoom += (this.camTarget.zoom - this.cam.zoom) * k;
    this.cam.x += (this.camTarget.x - this.cam.x) * k;
    this.cam.y += (this.camTarget.y - this.cam.y) * k;

    const live = [...this.nodes.values()].filter((n) => n.dying === null);

    // Soft collisions on the resting positions so nodes never overlap.
    for (let i = 0; i < live.length; i++) {
      for (let j = i + 1; j < live.length; j++) {
        const a = live[i];
        const b = live[j];
        const min = rad(a) + rad(b) + 46;
        let dx = b.tx - a.tx;
        let dy = b.ty - a.ty;
        let d = Math.hypot(dx, dy);
        if (d >= min) continue;
        if (d < 0.01) {
          dx = Math.random() - 0.5;
          dy = Math.random() - 0.5;
          d = Math.hypot(dx, dy);
        }
        const push = (min - d) * 0.08;
        const ux = dx / d;
        const uy = dy / d;
        const aLocked = this.drag?.id === a.data.id;
        const bLocked = this.drag?.id === b.data.id;
        if (!aLocked) {
          a.tx -= ux * push * (bLocked ? 2 : 1);
          a.ty -= uy * push * (bLocked ? 2 : 1);
        }
        if (!bLocked) {
          b.tx += ux * push * (aLocked ? 2 : 1);
          b.ty += uy * push * (aLocked ? 2 : 1);
        }
      }
    }

    // Springs toward the resting position.
    for (const n of this.nodes.values()) {
      if (now < n.born) continue;
      const stiffness = this.drag?.id === n.data.id ? 0.35 : 0.085;
      n.vx = (n.vx + (n.tx - n.x) * stiffness) * 0.74;
      n.vy = (n.vy + (n.ty - n.y) * stiffness) * 0.74;
      n.x += n.vx;
      n.y += n.vy;
      const hoverTarget = n.data.id === this.hovered || n.data.id === this.drag?.id ? 1 : 0;
      n.hover += (hoverTarget - n.hover) * 0.2;
      if (n.dying !== null && now - n.dying > 320) {
        this.nodes.delete(n.data.id);
        this.order = this.order.filter((id) => id !== n.data.id);
        this.particles = this.particles.filter((p) => p.edge !== n.data.id);
      }
    }

    // Re-link orphans whose parent was deleted.
    for (const n of this.nodes.values()) {
      if (n.parent && !this.nodes.has(n.parent)) {
        let best = Infinity;
        n.parent = null;
        for (const id of this.order) {
          const o = this.nodes.get(id);
          if (!o || o === n || o.dying !== null || this.order.indexOf(id) > this.order.indexOf(n.data.id)) continue;
          const d = Math.hypot(o.tx - n.tx, o.ty - n.ty);
          if (d < best) {
            best = d;
            n.parent = id;
          }
        }
      }
    }

    for (const p of this.particles) p.t = (p.t + p.speed / 60) % 1;
    this.ripples = this.ripples.filter((r) => now - r.born < 900);
  }

  private draw(now: number) {
    const { ctx } = this;
    const t = (now - this.start) / 1000;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);

    this.syncGrid();

    const z = this.cam.zoom;
    const pos = new Map<string, { x: number; y: number; r: number; s: number; a: number }>();
    for (const n of this.nodes.values()) {
      const age = (now - n.born) / 700;
      if (age < 0) continue;
      const grow = age >= 1 ? 1 : easeOutBack(clamp(age, 0, 1));
      const die = n.dying !== null ? 1 - clamp((now - n.dying) / 320, 0, 1) : 1;
      const floatX = Math.cos(t * 0.7 + n.phase) * 2.2;
      const floatY = Math.sin(t * 0.9 + n.phase) * 3.2;
      const sp = this.toScreen(n.x + floatX, n.y + floatY);
      const s = grow * die * (1 + n.hover * 0.08);
      pos.set(n.data.id, { x: sp.x, y: sp.y, r: rad(n) * z * s, s, a: clamp(die, 0, 1) * clamp(age * 3, 0, 1) });
    }

    // Links
    for (const n of this.nodes.values()) {
      if (!n.parent) continue;
      const a = pos.get(n.parent);
      const b = pos.get(n.data.id);
      if (!a || !b) continue;
      const parent = this.nodes.get(n.parent)!;
      const progress = clamp((now - n.born - 120) / 600, 0, 1);
      if (progress <= 0) continue;
      const lit = [this.selected, this.hovered].some((id) => id === n.data.id || id === n.parent);
      const { cx, cy } = this.curve(a, b);
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      grad.addColorStop(0, rgba(parent.data.color, (lit ? 0.75 : 0.38) * a.a));
      grad.addColorStop(1, rgba(n.data.color, (lit ? 0.75 : 0.38) * b.a));
      ctx.strokeStyle = grad;
      ctx.lineWidth = Math.max(1, (lit ? 2.6 : 1.8) * z);
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (progress < 1) {
        // Draw the curve partially while it grows in.
        const steps = 24;
        ctx.moveTo(a.x, a.y);
        for (let i = 1; i <= steps * progress; i++) {
          const q = this.quad(a, { x: cx, y: cy }, b, i / steps);
          ctx.lineTo(q.x, q.y);
        }
      } else {
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(cx, cy, b.x, b.y);
      }
      ctx.stroke();

      if (progress >= 1) {
        for (const p of this.particles) {
          if (p.edge !== n.data.id) continue;
          const q = this.quad(a, { x: cx, y: cy }, b, p.t);
          const color = p.t < 0.5 ? parent.data.color : n.data.color;
          const r = Math.max(1.5, 2.6 * z) * (lit ? 1.3 : 1) * 5;
          ctx.globalAlpha = Math.min(a.a, b.a);
          ctx.drawImage(glowSprite(color, '#ffffff', 1), q.x - r, q.y - r, r * 2, r * 2);
          ctx.globalAlpha = 1;
        }
      }
    }

    // Ripples
    for (const r of this.ripples) {
      const p = (now - r.born) / 900;
      const sp = this.toScreen(r.x, r.y);
      ctx.strokeStyle = rgba(r.color, 0.5 * (1 - p));
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, (20 + p * 90) * z, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Nodes (in order, so newer nodes sit on top)
    for (const id of this.order) {
      const n = this.nodes.get(id);
      const p = pos.get(id);
      if (!n || !p || p.r <= 0.5) continue;
      this.drawNode(n, p, t);
    }
  }

  private curve(a: { x: number; y: number }, b: { x: number; y: number }) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return { cx: mx - dy * 0.12, cy: my + dx * 0.12 };
  }

  private quad(a: { x: number; y: number }, c: { x: number; y: number }, b: { x: number; y: number }, t: number) {
    const u = 1 - t;
    return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
  }

  private gridKey = '';

  /** Dot grid as a CSS background on the canvas, updated only when the camera moves. */
  private syncGrid() {
    const spacing = 34 * this.cam.zoom;
    const origin = this.toScreen(0, 0);
    const key = `${spacing.toFixed(2)}|${origin.x.toFixed(1)}|${origin.y.toFixed(1)}`;
    if (key === this.gridKey) return;
    this.gridKey = key;
    const st = this.canvas.style;
    if (spacing < 10) {
      st.backgroundImage = 'none';
      return;
    }
    const dot = Math.max(0.9, 1.15 * Math.min(this.cam.zoom, 1.6));
    st.backgroundImage = `radial-gradient(circle, rgba(148,163,184,0.18) ${dot}px, transparent ${dot + 0.6}px)`;
    st.backgroundSize = `${spacing}px ${spacing}px`;
    st.backgroundPosition = `${origin.x - spacing / 2}px ${origin.y - spacing / 2}px`;
  }

  private drawNode(n: SimNode, p: { x: number; y: number; r: number; s: number; a: number }, t: number) {
    const { ctx } = this;
    const { x, y, r } = p;
    const color = n.data.color;
    const selected = this.selected === n.data.id;
    ctx.globalAlpha = p.a;

    // Glow
    const gr = r * (2.4 + n.hover * 0.6);
    ctx.globalAlpha = p.a * (0.85 + n.hover * 0.15);
    ctx.drawImage(glowSprite(color, null, 0.4), x - gr, y - gr, gr * 2, gr * 2);
    ctx.globalAlpha = p.a;

    // Selection: pulse and orbit
    if (selected) {
      const pulse = (t * 0.9) % 1;
      ctx.strokeStyle = rgba(color, 0.55 * (1 - pulse));
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, r + 6 + pulse * 26, 0, Math.PI * 2);
      ctx.stroke();

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * 0.8);
      ctx.setLineDash([6, 8]);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r + 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Sphere
    const body = ctx.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.05, x + r * 0.2, y + r * 0.25, r * 1.35);
    body.addColorStop(0, '#ffffff');
    body.addColorStop(0.12, rgba(color, 1));
    body.addColorStop(0.7, rgba(color, 0.92));
    body.addColorStop(1, rgba(color, 0.55));
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Glass highlight
    const shine = ctx.createLinearGradient(x, y - r, x, y);
    shine.addColorStop(0, 'rgba(255,255,255,0.55)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.ellipse(x, y - r * 0.42, r * 0.66, r * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rim
    ctx.strokeStyle = selected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)';
    ctx.lineWidth = selected ? 2 : 1;
    ctx.beginPath();
    ctx.arc(x, y, r - 0.5, 0, Math.PI * 2);
    ctx.stroke();

    // Reminder badge
    if (n.data.reminderEnabled && r > 14) {
      const bx = x + r * 0.72;
      const by = y - r * 0.72;
      const br = Math.max(7, r * 0.26);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(bx, by, br + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `${Math.round(br * 1.2)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔔', bx, by + 0.5);
    }

    // Label: shrink the font until the title fits inside the sphere.
    if (this.cam.zoom > 0.45) {
      const maxWidth = r * 1.62;
      let size = clamp(13 * this.cam.zoom * Math.min(1.1, p.s), 9, 17);
      let lines: string[] = [];
      for (; size >= 8; size -= 0.5) {
        ctx.font = `600 ${size}px 'Space Grotesk', 'Inter', sans-serif`;
        lines = this.wrap(n.data.title, maxWidth);
        if (lines.length <= 3 && lines.every((l) => ctx.measureText(l).width <= maxWidth)) break;
      }
      if (lines.length > 3) lines = [...lines.slice(0, 2), `${lines[2]}…`];
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lh = size * 1.16;
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1;
      ctx.fillStyle = '#ffffff';
      lines.forEach((line, i) => ctx.fillText(line, x, y - ((lines.length - 1) * lh) / 2 + i * lh));
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }
    ctx.globalAlpha = 1;
  }

  private wrap(text: string, max: number) {
    const { ctx } = this;
    const lines: string[] = [];
    let line = '';
    for (const w of text.split(/\s+/)) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > max && line) {
        lines.push(line);
        line = w;
      } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }
}
