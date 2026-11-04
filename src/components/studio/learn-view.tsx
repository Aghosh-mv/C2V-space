'use client';

// The Learner — a big library: sections of categories, each full of detailed
// tutorials, runnable code and principles for both languages.

import { useMemo, useState } from 'react';
import { BookOpen, Clock, ArrowRight, Search, Layers } from 'lucide-react';
import { LIBRARY, type Tutorial } from '@/lib/scenelang/learn';
import { parseStyleKit } from '@/lib/scenelang/stylekit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MiniThumb } from './mini-thumb';

interface Props {
  onLoadCode: (code: string, lang: 'scene' | 'style') => void;
}

function StyleCard({ code }: { code: string }) {
  const { tokens } = useMemo(() => parseStyleKit(code), [code]);
  if (!tokens) return <div className="h-full w-full bg-zinc-100" />;
  return (
    <div
      className="flex h-full w-full flex-col items-start justify-between p-6"
      style={{ background: `linear-gradient(160deg, ${tokens.bg[0]}, ${tokens.bg[1]})` }}
    >
      <span
        style={{ color: tokens.text, letterSpacing: tokens.letterSpacing, fontFamily: tokens.font }}
        className="text-2xl font-bold"
      >
        Aa — the quick brown fox
      </span>
      <div className="flex items-end justify-between w-full">
        <div className="flex gap-2">
          {tokens.palette.map((c, i) => (
            <span key={i} className="h-8 w-8 rounded-full border shadow-sm" style={{ background: c }} />
          ))}
        </div>
        <span style={{ color: tokens.dim }} className="text-[12px]">
          {tokens.name} · {tokens.font.startsWith('"Helvetica') ? 'sans' : tokens.font.startsWith('Georgia') ? 'serif' : 'mono'}
        </span>
      </div>
    </div>
  );
}

function TutorialList({
  tutorials,
  activeId,
  onPick,
}: {
  tutorials: Tutorial[];
  activeId: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="flex max-h-[62vh] flex-col gap-1.5 overflow-y-auto pr-1">
      {tutorials.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onPick(t.id)}
          className={cn(
            'rounded-2xl border px-4 py-2.5 text-left transition-all',
            activeId === t.id
              ? 'border-violet-300 bg-violet-50/70 shadow-sm'
              : 'border-zinc-200 bg-white hover:border-violet-200 hover:bg-violet-50/30',
          )}
        >
          <p className="text-[13px] font-semibold text-zinc-800">{t.title}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-400">
            <Clock className="h-3 w-3" /> {t.minutes} min · {t.lang === 'scene' ? 'SceneLang' : 'StyleKit'}
          </p>
        </button>
      ))}
    </div>
  );
}

export function LearnView({ onLoadCode }: Props) {
  const [sectionId, setSectionId] = useState(LIBRARY[0].id);
  const [activeId, setActiveId] = useState(LIBRARY[0].tutorials[0].id);
  const [query, setQuery] = useState('');

  const section = LIBRARY.find((s) => s.id === sectionId) ?? LIBRARY[0];
  const tutorial = section.tutorials.find((t) => t.id === activeId) ?? section.tutorials[0];

  const searching = query.trim().length > 0;
  const results = useMemo(() => {
    if (!searching) return [];
    const q = query.toLowerCase();
    return LIBRARY.flatMap((s) =>
      s.tutorials.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.points.some((p) => p.toLowerCase().includes(q)),
      ),
    );
  }, [query, searching]);

  const totalTutorials = LIBRARY.reduce((n, s) => n + s.tutorials.length, 0);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-5">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
          <BookOpen className="h-5 w-5 text-violet-600" /> The Learner — a library, not a list
        </h1>
        <p className="mt-1 text-[13.5px] text-zinc-500">
          {LIBRARY.length} sections · {totalTutorials} tutorials · every principle of SceneLang and StyleKit, explained and runnable.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_290px_1fr]">
        {/* sections column */}
        <aside className="flex flex-col gap-1.5">
          <div className="relative mb-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the library…"
              className="rounded-full pl-9"
              aria-label="Search tutorials"
            />
          </div>
          {LIBRARY.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setSectionId(s.id);
                setActiveId(s.tutorials[0].id);
                setQuery('');
              }}
              className={cn(
                'rounded-2xl border px-4 py-3 text-left transition-all',
                !searching && sectionId === s.id
                  ? 'border-violet-300 bg-white shadow-sm'
                  : 'border-transparent bg-white/50 hover:bg-white',
              )}
            >
              <p className="flex items-center gap-1.5 text-[13.5px] font-semibold text-zinc-800">
                <Layers className={cn('h-3.5 w-3.5', sectionId === s.id && !searching ? 'text-violet-600' : 'text-zinc-300')} />
                {s.title}
              </p>
              <p className="mt-0.5 text-[11.5px] text-zinc-400">{s.tutorials.length} tutorials</p>
            </button>
          ))}
        </aside>

        {/* tutorials column */}
        <aside>
          {searching ? (
            <TutorialList tutorials={results} activeId={activeId} onPick={setActiveId} />
          ) : (
            <>
              <p className="mb-2 px-1 text-[12px] leading-relaxed text-zinc-500">{section.blurb}</p>
              <TutorialList
                tutorials={section.tutorials}
                activeId={activeId}
                onPick={setActiveId}
              />
            </>
          )}
        </aside>

        {/* reading pane */}
        <article className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="h-56 border-b bg-zinc-50 sm:h-64">
            {tutorial.lang === 'scene' ? (
              <MiniThumb code={tutorial.code} className="h-full w-full" />
            ) : (
              <StyleCard code={tutorial.code} />
            )}
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold',
                  tutorial.lang === 'scene' ? 'bg-violet-100 text-violet-700' : 'bg-teal-100 text-teal-700',
                )}
              >
                {tutorial.lang === 'scene' ? 'SceneLang' : 'StyleKit'}
              </span>
              <span className="flex items-center gap-1 text-[11.5px] text-zinc-400">
                <Clock className="h-3 w-3" /> {tutorial.minutes} min read
              </span>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-zinc-900">{tutorial.title}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-zinc-600">{tutorial.summary}</p>
            <ul className="mt-4 space-y-2">
              {tutorial.points.map((p, i) => (
                <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-zinc-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <pre className="mt-5 max-h-72 overflow-auto rounded-2xl bg-zinc-50 p-4 font-mono text-[12px] leading-relaxed text-zinc-700">
              {tutorial.code}
            </pre>
            <Button
              onClick={() => onLoadCode(tutorial.code, tutorial.lang)}
              className="mt-4 gap-2 rounded-full bg-violet-600 text-white hover:bg-violet-700"
            >
              Try this tutorial in the Studio <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}
