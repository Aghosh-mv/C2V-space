'use client';

// Branded crash screen — the code autosaves to History, so a crash never loses work.

import { Clapperboard, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-teal-400 text-white shadow-md">
        <Clapperboard className="h-6 w-6" />
      </span>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Something snapped mid-render</h1>
      <p className="max-w-md text-[13.5px] leading-relaxed text-zinc-500">
        Your code is safe — it autosaves to History every few seconds. Reload to pick up right where you left off.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset} className="gap-1.5 rounded-full bg-violet-600 text-white hover:bg-violet-700">
          <RotateCcw className="h-4 w-4" /> Try again
        </Button>
        <Button variant="outline" className="rounded-full" onClick={() => location.assign('/')}>
          Back to the studio
        </Button>
      </div>
      {error.digest ? <p className="font-mono text-[11px] text-zinc-400">ref {error.digest}</p> : null}
    </div>
  );
}
