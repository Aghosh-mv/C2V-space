'use client';

// Live canvas thumbnail of SceneLang code — used in gallery cards & lessons.
// Renders lazily (only when scrolled near) and at reduced internal resolution
// so hundreds of marketplace cards stay light.

import { useEffect, useRef, useState } from 'react';
import { parseSceneLang } from '@/lib/scenelang/parser';
import { renderFrame, sceneSettleMs } from '@/lib/scenelang/renderer';
import type { AssetRef } from '@/lib/scenelang/types';
import type { Ctx } from '@/lib/scenelang/export';

interface Props {
  code: string;
  className?: string;
  assets?: AssetRef[];
}

export function MiniThumb({ code, className, assets }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '320px' },
    );
    io.observe(holder);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const canvas = ref.current;
    if (!canvas) return;
    const { spec } = parseSceneLang(code);
    const ctx = canvas.getContext('2d');
    if (!ctx || !spec) return;
    // render at reduced resolution — thumbs never need full size
    const scale = Math.min(1, 360 / spec.width);
    canvas.width = Math.round(spec.width * scale);
    canvas.height = Math.round(spec.height * scale);
    const t = spec.scenes.length > 0 ? spec.scenes[0].startMs + sceneSettleMs(spec.scenes[0]) : 0;
    ctx.scale(scale, scale);
    renderFrame(ctx as Ctx, spec, t, assets ? new Map(assets.map((a) => [a.name.toLowerCase(), a])) : undefined);
  }, [code, visible, assets]);

  return (
    <div ref={holderRef} className={className ?? 'h-full w-full'}>
      {visible ? (
        <canvas
          ref={ref}
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
      ) : (
        <div className="h-full w-full animate-pulse bg-gradient-to-br from-zinc-100 to-zinc-200" aria-hidden="true" />
      )}
    </div>
  );
}
