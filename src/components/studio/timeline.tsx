'use client';

// Timeline strip — one soft segment per scene, sized by duration, with playhead.

import { useRef } from 'react';
import { formatDuration } from '@/lib/scenelang/parser';
import { getTheme } from '@/lib/scenelang/themes';
import type { VideoSpec } from '@/lib/scenelang/types';
import { cn } from '@/lib/utils';

interface Props {
  spec: VideoSpec;
  tMs: number;
  onSeek: (ms: number) => void;
  disabled?: boolean;
}

export function Timeline({ spec, tMs, onSeek, disabled }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scenes = spec.scenes;
  const theme = getTheme(spec.theme);
  const total = Math.max(1, spec.totalMs);

  if (scenes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-white/60 px-4 py-3 text-center text-[12.5px] text-zinc-400">
        Your scenes will appear here as a timeline
      </div>
    );
  }

  const seekFromEvent = (clientX: number) => {
    const el = ref.current;
    if (!el || disabled) return;
    const rect = el.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onSeek(frac * spec.totalMs);
  };

  return (
    <div
      ref={ref}
      onPointerDown={(e) => seekFromEvent(e.clientX)}
      onPointerMove={(e) => e.buttons === 1 && seekFromEvent(e.clientX)}
      className={cn(
        'relative flex h-11 w-full cursor-pointer gap-1 overflow-hidden rounded-2xl border bg-white/70 p-1 select-none',
        disabled && 'pointer-events-none opacity-60',
      )}
      role="slider"
      aria-label="Timeline"
      aria-valuenow={Math.round(tMs)}
      aria-valuemin={0}
      aria-valuemax={spec.totalMs}
    >
      {scenes.map((scene, i) => {
        const active = tMs >= scene.startMs && tMs < scene.endMs;
        const color = theme.palette[i % theme.palette.length];
        return (
          <div
            key={`${scene.name}-${i}`}
            style={{
              flexGrow: scene.durationMs,
              flexBasis: 0,
              borderLeftColor: color,
            }}
            className={cn(
              'relative flex min-w-0 items-center overflow-hidden rounded-xl border-l-4 px-2.5 transition-colors',
              active ? 'bg-violet-50 shadow-sm' : 'bg-zinc-50 hover:bg-zinc-100',
            )}
          >
            <span className="truncate text-[11.5px] font-medium text-zinc-600">
              {scene.name}
            </span>
            <span className="ml-auto hidden shrink-0 pl-2 font-mono text-[10.5px] text-zinc-400 sm:block">
              {formatDuration(scene.durationMs)}
            </span>
          </div>
        );
      })}
      {/* playhead */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 w-0.5 rounded-full bg-violet-600 shadow-[0_0_6px_rgba(124,108,240,0.7)]"
        style={{ left: `calc(${(tMs / total) * 100}% - 1px)` }}
      >
        <div className="absolute -top-0.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-violet-600" />
      </div>
    </div>
  );
}
