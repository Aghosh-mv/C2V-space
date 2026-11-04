'use client';

// SceneLang editor — textarea with a live syntax-highlight overlay,
// line numbers, error banner and one-tap snippet chips for beginners.

import { useEffect, useMemo, useRef } from 'react';
import type { ParseError } from '@/lib/scenelang/types';
import { cn } from '@/lib/utils';

const FONT_CLASS = 'font-mono text-[12.5px] leading-[20px]';

const SCENE_TOKEN_RE =
  /(\/\/.*)|("(?:[^"\\]|\\.)*")|(#[0-9a-fA-F]{3,8})|(\{[^}]*\})|(\b(?:video|theme|scene|outro|bg|title|subtitle|text|bars|pie|image|sprite|lines|shape|import|inimportcode|transition)\b)|(\b(?:fade|in|out|rise|drop|slide|left|right|up|down|drift|zoom|from|to|over|spin|stagger|words|letters|items|by|type|on|wait|pulse|grow|sweep|bob|ease|delay|linear|in-out|crossfade|cut|gradient|solid|grid|px|ms|deg)\b)|(\b\d+(?:\.\d+)?\b)|(\(|\)|->|:)/g;

const STYLE_TOKEN_RE =
  /(\/\/.*)|(#[0-9a-fA-F]{3,8})|(rgba?\([^)]*\))|(\b(?:style|bg|ink|dim|accents|font|tracking|glow|vignette|orbs|motion|texture)\b)|(\b(?:on|off|sans|serif|mono)\b)|(\b\d+(?:\.\d+)?\b)/g;

function highlightLine(line: string, keyPrefix: string, re: RegExp) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  re.lastIndex = 0;
  let i = 0;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) nodes.push(line.slice(last, m.index));
    const [full, comment, str, hex, data, kw, action, num, punct] = m;
    let cls = '';
    if (comment) cls = 'text-zinc-400 italic';
    else if (str) cls = 'text-amber-600';
    else if (hex) cls = 'text-teal-700 font-medium';
    else if (data) cls = 'text-emerald-700';
    else if (kw) cls = 'text-violet-700 font-semibold';
    else if (action) cls = 'text-rose-500';
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

const SCENE_SNIPPETS: { label: string; code: string }[] = [
  {
    label: '+ Scene',
    code: '\nscene new-scene (4s)\n  transition crossfade 0.85s\n  title "Big idea"\n    fade in 0.55s\n    rise 22 over 0.6s\n    stagger words by 90ms\n  subtitle "one line of context"\n    type on over 1.4s\n',
  },
  {
    label: '+ Bars',
    code: '\n  bars {Mon:12, Tue:30, Wed:24}\n    grow over 0.9s\n    stagger items by 110ms\n',
  },
  { label: '+ Pie', code: '\n  pie {Yes:55, No:45}\n    sweep over 1.1s\n' },
  { label: '+ Grid bg', code: '\n  bg grid\n' },
  { label: '+ Gradient bg', code: '\n  bg gradient #fafafc -> #edeaf7\n    pulse 5s\n' },
  { label: '+ Image', code: '\n  image photo.jpg\n    fade in 0.5s\n    zoom from 100 to 112 over 5s\n    drift right 24 over 5s\n' },
  { label: '+ Sprite', code: '\n  sprite hero.png\n    fade in 0.5s\n    bob 8 over 2s\n' },
  { label: '+ Dialogue', code: '\n  lines dialogue.txt\n    fade in 0.5s\n' },
  { label: '+ Outro', code: '\nscene outro (3s)\n  transition zoom 0.8s\n  title "Thanks for watching"\n    fade in 0.5s\n    rise 20 over 0.6s\n    stagger words by 100ms\n' },
];

const STYLE_SNIPPETS: { label: string; code: string }[] = [
  { label: '+ bg', code: '\nbg #fafafc -> #edeaf7\n' },
  { label: '+ ink', code: '\nink #16161d\n' },
  { label: '+ accents', code: '\naccents #7c6cf0, #2bb59a, #16161d\n' },
  { label: '+ font', code: '\nfont sans\n' },
  { label: '+ tracking', code: '\ntracking 1\n' },
  { label: '+ vignette', code: '\nvignette 0.08\n' },
  { label: '+ orbs', code: '\norbs 6\n' },
];

interface Props {
  code: string;
  onChange: (code: string) => void;
  errors: ParseError[];
  readOnly?: boolean;
  language?: 'scene' | 'style';
}

export function CodeEditor({ code, onChange, errors, readOnly, language = 'scene' }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const focusedRef = useRef(false);

  const tokenRe = language === 'style' ? STYLE_TOKEN_RE : SCENE_TOKEN_RE;
  const snippets = language === 'style' ? STYLE_SNIPPETS : SCENE_SNIPPETS;

  const lines = useMemo(() => code.split('\n'), [code]);
  const highlighted = useMemo(
    () => lines.flatMap((line, i) => highlightLine(line, `l${i}`, tokenRe)),
    [lines, tokenRe],
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
        {snippets.map((s) => (
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
            /* purely decorative highlight overlay derived from `code`; the textarea is the
               source of truth — ignore transient mismatches (e.g. mid-HMR states) */
            suppressHydrationWarning
            className={cn(
              'pointer-events-none absolute inset-0 overflow-hidden whitespace-pre p-4',
              FONT_CLASS,
              'text-zinc-800',
            )}
          >
          {/* guard span first: the HTML parser drops a newline that directly follows
              <pre> — without this, an empty/leading-blank-line buffer hydrates empty */}
          <span aria-hidden="true" />
          {highlighted}
          </pre>
          <textarea
            ref={taRef}
            value={code}
            readOnly={readOnly}
            spellCheck={false}
            onChange={(e) => onChange(e.target.value)}
            onScroll={syncScroll}
            onFocus={() => {
              focusedRef.current = true;
            }}
            onBlur={() => {
              focusedRef.current = false;
            }}
            aria-label="SceneLang code editor"
            placeholder={
              language === 'scene'
                ? '// blank canvas — type your first scene:\n// video 1280x720 30fps\n// theme aurora\n// scene hello (4s)'
                : '// blank style — start with:\n// style my-look\n// bg #fafafc -> #edeaf7\n// ink #16161d'
            }
            className={cn(
              'absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent p-4',
              FONT_CLASS,
              'text-transparent caret-violet-600 outline-none',
            )}
          />
        </div>
      </div>

      {/* error banner */}
      {errors.length > 0 && (
        <div className="max-h-24 overflow-y-auto border-t border-rose-200 bg-rose-50 px-3 py-2">
          {errors.slice(0, 4).map((e, i) => (
            <p key={i} className="text-[12px] text-rose-700">
              <span className="font-semibold">{e.line > 0 ? `Line ${e.line}` : 'Note'}</span> — {e.message}
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
