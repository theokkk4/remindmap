'use client';

import './globals.css';
import { LiteNoticeDialog } from '@/components/LiteNotice';

// Last-resort fallback when the root layout itself fails.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950">
        <LiteNoticeDialog reason="error" detail={error.message} onRetry={reset} />
      </body>
    </html>
  );
}
