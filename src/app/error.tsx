'use client';

import { useEffect } from 'react';
import { LiteNoticeDialog } from '@/components/LiteNotice';

// Shown when a page crashes while rendering.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen">
      <LiteNoticeDialog reason="error" detail={error.message} onRetry={reset} onClose={() => (window.location.href = '/')} />
    </main>
  );
}
