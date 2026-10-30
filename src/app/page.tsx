'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useLiteNotice } from '@/components/LiteNotice';
import { CONTACT, mailtoFullVersion } from '@/lib/contact';

const HeroMap = dynamic(() => import('@/components/HeroMap'), { ssr: false });

const FEATURES = [
  {
    icon: '◎',
    title: 'Physics-based canvas',
    text: 'Nodes spring into place, repel each other and float at rest. Drag anything; links follow with animated particles.',
  },
  {
    icon: '◷',
    title: 'Reminders that fire',
    text: 'Daily, weekly or monthly reminders on any node, delivered as browser notifications and in-app toasts.',
  },
  {
    icon: '◆',
    title: 'Priorities and colour',
    text: 'Four priority levels change a node’s size; six colours group branches at a glance.',
  },
  {
    icon: '⌘',
    title: 'Keyboard-first',
    text: 'N adds a node that branches off your selection. S exports, I opens stats. No menus to dig through.',
  },
  {
    icon: '⇅',
    title: 'Export and import',
    text: 'Copy your map as text, download it as JSON, or import a JSON file. Positions are saved too.',
  },
  {
    icon: '◈',
    title: 'Private by default',
    text: 'Everything lives in IndexedDB in your browser. Installable as a PWA, works offline, no account.',
  },
];

const FULL = ['Deadline risk analysis', 'Conflict detection across branches', 'Smart node suggestions', 'Natural-language capture'];

export default function Home() {
  const liteNotice = useLiteNotice();

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

        :root {
          --bg: #070a17;
          --surface: rgba(255, 255, 255, 0.035);
          --line: rgba(255, 255, 255, 0.08);
          --line-strong: rgba(255, 255, 255, 0.14);
          --fg: #eef1f8;
          --dim: #8f97ad;
          --faint: #5b6378;
          --blue: #3b82f6;
          --blue-soft: #7da2ff;
          --violet: #8b5cf6;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          background: var(--bg);
          color: var(--fg);
          font-family: 'Inter', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: clip;
        }
        body::before { display: none; }
        h1, h2, h3 { font-family: 'Space Grotesk', 'Inter', sans-serif; letter-spacing: -0.02em; }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; }

        .wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }

        /* Nav */
        .nav {
          position: sticky; top: 0; z-index: 50;
          height: 64px; display: flex; align-items: center;
          background: rgba(7, 10, 23, 0.75); backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--line);
        }
        .nav .wrap { display: flex; align-items: center; justify-content: space-between; width: 100%; }
        .brand { display: inline-flex; align-items: center; gap: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 17px; }
        .brand-mark {
          width: 26px; height: 26px; border-radius: 8px;
          background: radial-gradient(circle at 35% 30%, #fff 0%, #93c5fd 18%, #3b82f6 55%, #1e3a8a 100%);
          box-shadow: 0 0 18px rgba(59, 130, 246, 0.55);
        }
        .nav-links { display: none; gap: 28px; font-size: 14px; color: var(--dim); }
        .nav-links a:hover { color: var(--fg); }
        @media (min-width: 768px) { .nav-links { display: flex; } }

        .btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          height: 40px; padding: 0 18px; border-radius: 12px; border: none;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
        }
        .btn:active { transform: scale(0.98); }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff;
          box-shadow: 0 10px 30px -10px rgba(59, 130, 246, 0.9), inset 0 0 0 1px rgba(255, 255, 255, 0.12);
        }
        .btn-primary:hover { box-shadow: 0 14px 34px -10px rgba(59, 130, 246, 1), inset 0 0 0 1px rgba(255, 255, 255, 0.2); transform: translateY(-1px); }
        .btn-secondary { background: var(--surface); color: var(--fg); box-shadow: inset 0 0 0 1px var(--line-strong); }
        .btn-secondary:hover { background: rgba(255, 255, 255, 0.07); }
        .btn-lg { height: 48px; padding: 0 22px; font-size: 15px; }
        .btn-sm { height: 34px; padding: 0 14px; font-size: 13px; }

        /* Hero */
        .hero { position: relative; overflow: hidden; }
        .hero-glow {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(60% 55% at 70% 20%, rgba(59, 130, 246, 0.22), transparent 70%),
            radial-gradient(45% 45% at 15% 90%, rgba(139, 92, 246, 0.18), transparent 70%);
        }
        .hero .wrap {
          position: relative; display: grid; gap: 48px; align-items: center;
          padding-top: 56px; padding-bottom: 72px;
        }
        @media (min-width: 960px) {
          .hero .wrap { grid-template-columns: 0.95fr 1.05fr; padding-top: 88px; padding-bottom: 96px; }
        }
        .chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .chip {
          display: inline-flex; align-items: center; gap: 8px; height: 30px; padding: 0 12px;
          border-radius: 999px; font-size: 12.5px; color: var(--dim);
          background: var(--surface); box-shadow: inset 0 0 0 1px var(--line);
        }
        .chip-live { width: 7px; height: 7px; border-radius: 50%; background: #34d399; box-shadow: 0 0 10px #34d399; }
        .chip-lite {
          color: #fcd34d; background: rgba(251, 191, 36, 0.1); box-shadow: inset 0 0 0 1px rgba(251, 191, 36, 0.3);
          cursor: pointer; border: none;
        }
        .chip-lite:hover { background: rgba(251, 191, 36, 0.18); }
        .chip-lite .dot { width: 6px; height: 6px; border-radius: 50%; background: #fcd34d; box-shadow: 0 0 8px #fcd34d; }

        .hero h1 {
          margin-top: 24px; font-size: clamp(38px, 5.4vw, 60px); line-height: 1.04; font-weight: 700;
        }
        .hero h1 span {
          background: linear-gradient(90deg, #7da2ff 0%, #c4b5fd 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .hero p { margin-top: 20px; max-width: 460px; font-size: 16.5px; line-height: 1.65; color: var(--dim); }
        .hero-actions { margin-top: 32px; display: flex; flex-wrap: wrap; gap: 12px; }
        .hero-stats {
          margin-top: 44px; display: grid; grid-template-columns: repeat(3, auto); gap: 32px;
          padding-top: 24px; border-top: 1px solid var(--line); width: fit-content;
        }
        .hero-stats dt { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; }
        .hero-stats dd { margin-top: 2px; font-size: 12.5px; color: var(--faint); }

        .hero-frame {
          position: relative; border-radius: 22px; padding: 10px;
          background: rgba(255, 255, 255, 0.04);
          box-shadow: inset 0 0 0 1px var(--line-strong), 0 40px 90px -30px rgba(0, 0, 0, 0.9);
        }
        .hero-frame::before {
          content: ''; position: absolute; inset: -40px; z-index: -1; border-radius: 40px;
          background: radial-gradient(closest-side, rgba(59, 130, 246, 0.25), transparent);
          filter: blur(10px);
        }
        .hero-bar { display: flex; align-items: center; gap: 6px; padding: 4px 8px 10px; }
        .hero-bar i { width: 10px; height: 10px; border-radius: 50%; background: rgba(255, 255, 255, 0.12); }
        .hero-bar span { margin-left: 10px; font-family: ui-monospace, monospace; font-size: 11px; color: var(--faint); }
        .hero-screen { position: relative; height: 420px; border-radius: 14px; overflow: hidden; background: #0a0e27; }
        @media (min-width: 960px) { .hero-screen { height: 500px; } }
        .hero-canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
        .hero-caption {
          position: absolute; left: 14px; bottom: 14px;
          display: inline-flex; align-items: center; gap: 8px; height: 30px; padding: 0 12px;
          border-radius: 999px; font-size: 12px; color: var(--dim);
          background: rgba(7, 10, 23, 0.8); box-shadow: inset 0 0 0 1px var(--line-strong); backdrop-filter: blur(8px);
        }

        /* Sections */
        section { border-top: 1px solid var(--line); }
        .section { padding: 96px 0; }
        .eyebrow { font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--blue-soft); }
        .section h2 { margin-top: 12px; font-size: clamp(28px, 3.6vw, 40px); font-weight: 700; line-height: 1.15; }
        .section-lead { margin-top: 12px; max-width: 520px; font-size: 15px; line-height: 1.6; color: var(--dim); }
        .section-head { display: flex; flex-direction: column; gap: 16px; justify-content: space-between; }
        @media (min-width: 768px) { .section-head { flex-direction: row; align-items: flex-end; } }

        .grid { display: grid; gap: 14px; margin-top: 44px; }
        @media (min-width: 640px) { .grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 960px) { .grid { grid-template-columns: repeat(3, 1fr); } }
        .card {
          padding: 26px; border-radius: 18px; background: var(--surface);
          box-shadow: inset 0 0 0 1px var(--line); transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }
        .card:hover { background: rgba(255, 255, 255, 0.055); box-shadow: inset 0 0 0 1px rgba(125, 162, 255, 0.4); transform: translateY(-2px); }
        .card-icon {
          display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px;
          background: rgba(59, 130, 246, 0.14); color: var(--blue-soft); font-size: 18px;
          box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.3);
        }
        .card h3 { margin-top: 20px; font-size: 17px; font-weight: 600; }
        .card p { margin-top: 6px; font-size: 14px; line-height: 1.6; color: var(--dim); }

        /* How it works */
        .steps { display: grid; gap: 1px; margin-top: 44px; border-radius: 18px; overflow: hidden; background: var(--line); }
        @media (min-width: 768px) { .steps { grid-template-columns: repeat(3, 1fr); } }
        .step { padding: 28px; background: #0b0f1f; }
        .step-num { font-family: ui-monospace, monospace; font-size: 12px; color: var(--faint); }
        .step kbd {
          display: inline-block; margin-left: 8px; padding: 1px 7px; border-radius: 6px;
          font-family: ui-monospace, monospace; font-size: 11px; color: var(--fg);
          background: rgba(255, 255, 255, 0.08); box-shadow: inset 0 0 0 1px var(--line-strong);
        }
        .step h3 { margin-top: 22px; font-size: 18px; font-weight: 600; }
        .step p { margin-top: 6px; font-size: 14px; line-height: 1.6; color: var(--dim); }

        /* Full version */
        .full {
          margin-top: 44px; display: grid; gap: 24px; padding: 32px; border-radius: 22px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(139, 92, 246, 0.1));
          box-shadow: inset 0 0 0 1px rgba(125, 162, 255, 0.25);
        }
        @media (min-width: 860px) { .full { grid-template-columns: 1.1fr 0.9fr; align-items: center; padding: 40px; } }
        .full h3 { font-size: 26px; font-weight: 700; }
        .full p { margin-top: 10px; font-size: 15px; line-height: 1.6; color: var(--dim); }
        .full ul { margin-top: 18px; display: grid; gap: 10px; font-size: 14px; }
        .full li { display: flex; align-items: center; gap: 10px; }
        .full li::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #34d399; box-shadow: 0 0 10px #34d399; }
        .full-actions { display: flex; flex-direction: column; gap: 10px; }
        .full-actions .btn { width: 100%; }
        .full-note { font-size: 12.5px; color: var(--faint); text-align: center; }

        footer { border-top: 1px solid var(--line); padding: 32px 0; font-size: 12.5px; color: var(--faint); }
        footer .wrap { display: flex; flex-direction: column; gap: 10px; }
        @media (min-width: 768px) { footer .wrap { flex-direction: row; align-items: center; justify-content: space-between; } }
        footer a { color: var(--blue-soft); }

        @keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        .rise { animation: rise 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
        .rise-2 { animation-delay: 0.12s; }
      `}</style>

      <header className="nav">
        <div className="wrap">
          <Link href="/" className="brand">
            <span className="brand-mark" /> ReMindMap
          </Link>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#full">Full version</a>
          </nav>
          <Link href="/map" className="btn btn-primary btn-sm">
            Open the app
          </Link>
        </div>
      </header>

      <main>
        <section className="hero" style={{ borderTop: 'none' }}>
          <div className="hero-glow" />
          <div className="wrap">
            <div className="rise">
              <div className="chip-row">
                <span className="chip">
                  <span className="chip-live" /> Live demo · no account
                </span>
                <button className="chip chip-lite" onClick={() => liteNotice({ reason: 'info' })}>
                  <span className="dot" /> Lite build · no API key
                </button>
              </div>
              <h1>
                Mind maps that <span>move with your thinking.</span>
              </h1>
              <p>
                A physics-driven canvas for ideas, plans and reminders. Nodes spring into place, branches grow as you type, and
                nothing leaves your browser.
              </p>
              <div className="hero-actions">
                <Link href="/map" className="btn btn-primary btn-lg">
                  Open the app →
                </Link>
                <a href="#how" className="btn btn-secondary btn-lg">
                  How it works
                </a>
              </div>
              <dl className="hero-stats">
                <div>
                  <dt>60 fps</dt>
                  <dd>canvas renderer</dd>
                </div>
                <div>
                  <dt>0</dt>
                  <dd>accounts or servers</dd>
                </div>
                <div>
                  <dt>1 key</dt>
                  <dd>to add a node</dd>
                </div>
              </dl>
            </div>

            <div className="hero-frame rise rise-2">
              <div className="hero-bar">
                <i />
                <i />
                <i />
                <span>remindmap · building a map</span>
              </div>
              <div className="hero-screen">
                <HeroMap />
                <span className="hero-caption">
                  <span className="chip-live" /> Rendered live by the real engine
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="section">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="eyebrow">What’s in the demo</p>
                <h2>Everything here actually works.</h2>
              </div>
              <p className="section-lead">No mock buttons. Every feature below runs in this build, in your browser, right now.</p>
            </div>
            <div className="grid">
              {FEATURES.map((f) => (
                <article className="card" key={f.title}>
                  <div className="card-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="section">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="eyebrow">How it works</p>
                <h2>Three keys and a canvas.</h2>
              </div>
              <Link href="/map" className="btn btn-secondary">
                Try it with a sample map
              </Link>
            </div>
            <ol className="steps">
              <li className="step">
                <span className="step-num">
                  01 <kbd>N</kbd>
                </span>
                <h3>Add a thought</h3>
                <p>Press N, type, hit Enter. The node branches off whatever you have selected and springs into free space.</p>
              </li>
              <li className="step">
                <span className="step-num">
                  02 <kbd>drag</kbd>
                </span>
                <h3>Shape the map</h3>
                <p>Drag nodes and they push neighbours aside. Scroll to zoom toward the cursor, drag the background to pan.</p>
              </li>
              <li className="step">
                <span className="step-num">
                  03 <kbd>🔔</kbd>
                </span>
                <h3>Never forget it</h3>
                <p>Open any node, set a daily, weekly or monthly reminder, and get notified in the browser when it’s due.</p>
              </li>
            </ol>
          </div>
        </section>

        <section id="full" className="section">
          <div className="wrap">
            <p className="eyebrow">Full version</p>
            <h2>This is the lite build.</h2>
            <div className="full">
              <div>
                <h3>The AI layer is switched off here.</h3>
                <p>
                  The full version connects the map to a language model. It reads your branches, due dates and priorities and
                  works with you on them:
                </p>
                <ul>
                  {FULL.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <div className="full-actions">
                <a href={CONTACT.linkedin} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg">
                  DM me on LinkedIn
                </a>
                <a href={mailtoFullVersion('ReMindMap')} className="btn btn-secondary btn-lg">
                  {CONTACT.email}
                </a>
                <p className="full-note">Hit me up and I’ll set you up with the full version.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <span className="brand">
            <span className="brand-mark" /> ReMindMap
          </span>
          <p>
            Lite demo · runs entirely in your browser · <a href={CONTACT.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            {' · '}
            <a href={mailtoFullVersion('ReMindMap')}>{CONTACT.email}</a>
          </p>
        </div>
      </footer>
    </>
  );
}
