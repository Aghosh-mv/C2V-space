'use client';

// Live canvas thumbnail of SceneLang code — used in gallery cards & lessons.

import { useEffect, useRef } from 'react';
import { parseSceneLang } from '@/lib/scenelang/parser';
import { renderFrame, sceneSettleMs } from '@/lib/scenelang/renderer';
import type { Ctx } from '@/lib/scenelang/export';

export function MiniThumb({ code, className }: { code: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const { spec } = parseSceneLang(code);
    const ctx = canvas.getContext('2d');
    if (!ctx || !spec) return;
    const t = spec.scenes.length > 0 ? spec.scenes[0].startMs + sceneSettleMs(spec.scenes[0]) : 0;
    renderFrame(ctx as Ctx, spec, t);
  }, [code]);

  return (
    <canvas
      ref={ref}
      className={className ?? 'h-full w-full object-cover'}
      aria-hidden="true"
    />
  );
}
