'use client';

// SceneLang editor — textarea with a live syntax-highlight overlay,
// line numbers, error banner and one-tap snippet chips for beginners.

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ParseError } from '@/lib/scenelang/types';
import { cn } from '@/lib/utils';

const FONT_CLASS = 'font-mono text-[12.5px] leading-[20px]';

const TOKEN_RE =
  /(\/\/.*)|("(?:[^"\\]|\\.)*")|(#[0-9a-fA-F]{3,8})|(\{[^}]*\})|(\b(?:video|theme|scene|outro|bg|title|subtitle|text|bars|pie|image|shape)\b)|(\b(?:kinetic|typewriter|pop|fade-up|fade|slide-left|slide-right|zoom-in|pan|pulse|glow|grow|spin|gradient|solid|grid)\b)|(\b\d+(?:\.\d+)?\b)|(\(|\)|->)/g;

function highlightLine(line: string, keyPrefix: string) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  let i = 0;
  while ((m = TOKEN_RE.exec(line)) !== null) {
    if (m.index > last) nodes.push(line.slice(last, m.index));
    const [full, comment, str, hex, data, kw, anim, num, punct] = m;
    let cls = '';
    if (comment) cls = 'text-zinc-400 italic';
    else if (str) cls = 'text-amber-600';
    else if (hex) cls = 'text-teal-700 font-medium';
    else if (data) cls = 'text-emerald-700';
    else if (kw) cls = 'text-violet-700 font-semibold';
    else if (anim) cls = 'text-rose-500';
    else if (num) cls = 'text-cyan-700';
    else if (punct) cls = 'text-zinc-400';
    nodes.push(
      <span key={`${keyPrefix}-${i++}`} className={cls}>
        {full}
      </span>,
    );
    last = m.index + full.length;
  }
  if (last < line.length) nodes.push(line.slice(last));
  nodes.push('\n');
  return nodes;
}

const SNIPPETS: { label: string; code: string }[] = [
  {
    label: '+ Scene',
    code: '\nscene new-scene (4s) fade-up\n  title "Big idea" kinetic\n  subtitle "one line of context" typewriter\n',
  },
  { label: '+ Bars', code: '\n  bars {Mon:12, Tue:30, Wed:24} grow\n' },
  { label: '+ Pie', code: '\n  pie {Yes:55, No:45} spin\n' },
  { label: '+ Grid bg', code: '\n  bg grid\n' },
  { label: '+ Gradient bg', code: '\n  bg gradient #fafafc -> #edeaf7 pulse\n' },
  { label: '+ Image', code: '\n  image https://example.com/photo.jpg zoom-in\n' },
  { label: '+ Outro', code: '\nscene outro (3s) zoom-in\n  title "Thanks for watching" kinetic\n' },
];

interface Props {
  code: string;
  onChange: (code: string) => void;
  errors: ParseError[];
  readOnly?: boolean;
}

export function CodeEditor({ code, onChange, errors, readOnly }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  const lines = useMemo(() => code.split('\n'), [code]);
  const highlighted = useMemo(
    () => lines.flatMap((line, i) => highlightLine(line, `l${i}`)),
    [lines],
  );
  const errorLines = useMemo(() => new Set(errors.map((e) => e.line)), [errors]);

  const syncScroll = () => {
    const ta = taRef.current;
    if (!ta) return;
    if (preRef.current) {
      preRef.current.scrollTop = ta.scrollTop;
      preRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
  };

  useEffect(syncScroll, [code]);

  const insertSnippet = (snippet: string) => {
    onChange(code.replace(/\n*$/, '\n') + snippet);
    requestAnimationFrame(() => {
      const ta = taRef.current;
      if (ta) {
        ta.scrollTop = ta.scrollHeight;
        syncScroll();
      }
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* snippet chips */}
      <div className="flex flex-wrap gap-1.5 border-b bg-zinc-50/80 px-3 py-2">
        {SNIPPETS.map((s) => (
          <button
            key={s.label}
            type="button"
            disabled={readOnly}
            onClick={() => insertSnippet(s.code)}
            className="rounded-full border bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:border-violet-300 hover:text-violet-700 disabled:opacity-40"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* editor body */}
      <div className="relative flex min-h-0 flex-1">
        {/* line numbers */}
        <div
          ref={gutterRef}
          aria-hidden="true"
          className={cn(
            'w-10 shrink-0 overflow-hidden border-r bg-zinc-50/60 pt-4 text-right select-none',
            FONT_CLASS,
            'text-zinc-400',
          )}
        >
          {lines.map((_, i) => (
            <div key={i} className={cn('pr-2', errorLines.has(i + 1) && 'bg-rose-100/70 text-rose-600')}>
              {i + 1}
            </div>
          ))}
        </div>

        <div className="relative min-h-0 flex-1">
          <pre
            ref={preRef}
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-0 overflow-hidden whitespace-pre p-4',
              FONT_CLASS,
              'text-zinc-800',
            )}
          >
            {highlighted}
          </pre>
          <textarea
            ref={taRef}
            value={code}
            readOnly={readOnly}
            spellCheck={false}
            onChange={(e) => onChange(e.target.value)}
            onScroll={syncScroll}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label="SceneLang code editor"
            className={cn(
              'absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent p-4',
              FONT_CLASS,
              'text-transparent caret-violet-600 outline-none',
              focused && 'bg-violet-50/20',
            )}
          />
        </div>
      </div>

      {/* error banner */}
      {errors.length > 0 && (
        <div className="max-h-24 overflow-y-auto border-t border-rose-200 bg-rose-50 px-3 py-2">
          {errors.slice(0, 4).map((e, i) => (
            <p key={i} className="text-[12px] text-rose-700">
              <span className="font-semibold">Line {e.line}</span> — {e.message}
            </p>
          ))}
          {errors.length > 4 && (
            <p className="text-[11px] text-rose-500">+{errors.length - 4} more…</p>
          )}
        </div>
      )}
    </div>
  );
}
