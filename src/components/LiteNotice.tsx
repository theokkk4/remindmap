'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { CONTACT, mailtoFullVersion } from '@/lib/contact';

export type LiteReason = 'api' | 'error' | 'info';

export interface LiteNoticeOptions {
  reason: LiteReason;
  /** The feature that needs the full version, e.g. "AI Assist". */
  feature?: string;
  /** Technical detail shown in small print, e.g. an error message. */
  detail?: string;
}

const LiteContext = createContext<(o: LiteNoticeOptions) => void>(() => {});

/** Opens the "lite demo / no API key" dialog from anywhere in the app. */
export const useLiteNotice = () => useContext(LiteContext);

// Errors that are noise rather than real failures.
const IGNORED = [/ResizeObserver loop/i, /^Script error\.?$/i, /AbortError/i, /The user aborted/i, /chrome-extension:/i];

/**
 * Provides the lite-demo dialog and shows it whenever an unexpected error
 * reaches the window, so testers never hit a silent dead end.
 */
export function LiteNoticeProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<LiteNoticeOptions | null>(null);
  const openRef = useRef(false);
  const show = useCallback((o: LiteNoticeOptions) => {
    // Don't let a burst of errors replace a notice someone is reading.
    if (openRef.current && o.reason === 'error') return;
    openRef.current = true;
    setNotice(o);
  }, []);
  const close = useCallback(() => {
    openRef.current = false;
    setNotice(null);
  }, []);

  useEffect(() => {
    const report = (message: string) => {
      if (!message || IGNORED.some((re) => re.test(message))) return;
      show({ reason: 'error', detail: message.slice(0, 240) });
    };
    const onError = (e: ErrorEvent) => {
      // Resource loading errors (images, fonts) have no message; skip them.
      if (!e.message) return;
      report(e.error?.message ?? e.message);
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason;
      report(r instanceof Error ? r.message : typeof r === 'string' ? r : 'An operation failed unexpectedly.');
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, [show]);

  return (
    <LiteContext.Provider value={show}>
      {children}
      {notice && <LiteNoticeDialog {...notice} onClose={close} />}
    </LiteContext.Provider>
  );
}

const COPY: Record<LiteReason, (feature?: string) => { title: string; body: string }> = {
  api: (feature) => ({
    title: `${feature ?? 'This feature'} is in the full version`,
    body: `This is a dumbed-down demo that runs without an API key, so ${feature ?? 'this feature'} and the other AI features are switched off.`,
  }),
  error: () => ({
    title: 'Something went wrong',
    body: 'This is a dumbed-down demo running without an API key, so some things that need it can fail. Your map is saved in this browser, so you can keep going.',
  }),
  info: () => ({
    title: 'You’re using the lite demo',
    body: 'This is a dumbed-down version running without an API key. Mapping, reminders, import and export all work right here in your browser — the AI features are switched off.',
  }),
};

export function LiteNoticeDialog({ reason, feature, detail, onClose, onRetry }: LiteNoticeOptions & { onClose?: () => void; onRetry?: () => void }) {
  const { title, body } = COPY[reason](feature);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: the address is visible anyway */
    }
  };

  return (
    <div className="lite-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="lite-title">
      <style>{LITE_CSS}</style>
      <div className="lite-card" onClick={(e) => e.stopPropagation()}>
        <div className="lite-top">
          <span className="lite-badge">
            <span className="lite-badge-dot" />
            Lite demo · No API key
          </span>
          {onClose && (
            <button onClick={onClose} className="lite-x" aria-label="Close">
              ✕
            </button>
          )}
        </div>

        <h2 id="lite-title" className="lite-title">
          {title}
        </h2>
        <p className="lite-body">{body}</p>
        {detail && <p className="lite-detail">{detail}</p>}

        <div className="lite-cta">
          <p className="lite-cta-title">Want the full version?</p>
          <p className="lite-cta-text">
            Hit me up — DM me on LinkedIn or email <span className="lite-email">{CONTACT.email}</span>.
          </p>
          <div className="lite-actions">
            <a href={CONTACT.linkedin} target="_blank" rel="noreferrer" className="lite-btn lite-btn-primary">
              💬 DM on LinkedIn
            </a>
            <a href={mailtoFullVersion('ReMindMap')} className="lite-btn">
              ✉️ Email me
            </a>
            <button onClick={copyEmail} className="lite-btn lite-btn-ghost">
              {copied ? 'Copied ✓' : 'Copy email'}
            </button>
          </div>
        </div>

        <div className="lite-footer">
          {onRetry && (
            <button onClick={onRetry} className="lite-btn">
              Try again
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="lite-btn lite-btn-ghost">
              Keep exploring
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Plain class selectors so the app's global `* { margin: 0; padding: 0 }` reset can't flatten the dialog.
const LITE_CSS = `
@keyframes liteFade { from { opacity: 0 } to { opacity: 1 } }
@keyframes liteIn { from { opacity: 0; transform: translateY(10px) scale(.97) } to { opacity: 1; transform: none } }
.lite-overlay { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(2, 6, 23, 0.7); backdrop-filter: blur(6px); animation: liteFade .2s ease; font-family: 'Inter', system-ui, sans-serif; }
.lite-card { width: 100%; max-width: 460px; padding: 24px; border-radius: 18px; border: 1px solid rgba(96, 165, 250, 0.25); background: rgba(15, 23, 42, 0.96); color: #f1f5f9; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6); animation: liteIn .28s cubic-bezier(.2,.9,.3,1.2); }
.lite-top { display: flex; align-items: center; justify-content: space-between; }
.lite-badge { display: inline-flex; align-items: center; gap: 8px; padding: 5px 12px; border-radius: 999px; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); color: #fcd34d; font-size: 12px; font-weight: 600; }
.lite-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #fcd34d; box-shadow: 0 0 8px #fcd34d; }
.lite-x { padding: 4px 8px; border: none; border-radius: 8px; background: transparent; color: #94a3b8; font-size: 14px; cursor: pointer; }
.lite-x:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }
.lite-title { margin-top: 18px; font-size: 21px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.25; }
.lite-body { margin-top: 8px; font-size: 14px; line-height: 1.6; color: #cbd5e1; }
.lite-detail { margin-top: 12px; padding: 8px 12px; border-radius: 10px; background: rgba(0, 0, 0, 0.3); font-family: ui-monospace, SFMono-Regular, monospace; font-size: 11.5px; line-height: 1.5; color: #94a3b8; word-break: break-word; }
.lite-cta { margin-top: 20px; padding: 16px; border-radius: 14px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(96, 165, 250, 0.2); }
.lite-cta-title { font-size: 14px; font-weight: 600; color: #f8fafc; }
.lite-cta-text { margin-top: 4px; font-size: 14px; line-height: 1.5; color: #cbd5e1; }
.lite-email { color: #93c5fd; }
.lite-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.lite-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px; border-radius: 10px; border: none; background: rgba(255, 255, 255, 0.1); color: #fff; font-size: 13.5px; font-weight: 600; text-decoration: none; cursor: pointer; transition: background .15s ease, transform .15s ease; font-family: inherit; }
.lite-btn:hover { background: rgba(255, 255, 255, 0.16); transform: translateY(-1px); }
.lite-btn-primary { background: #3b82f6; box-shadow: 0 8px 24px -8px rgba(59, 130, 246, 0.8); }
.lite-btn-primary:hover { background: #60a5fa; }
.lite-btn-ghost { background: transparent; color: #cbd5e1; }
.lite-btn-ghost:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }
.lite-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }
`;
