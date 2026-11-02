'use client';

// Learn view — the library where you learn both coding languages.

import { useState } from 'react';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { LESSONS, STYLEKIT_LESSONS, type Lesson } from '@/lib/scenelang/learn';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MiniThumb } from './mini-thumb';

interface Props {
  onLoadCode: (code: string) => void;
}

function LessonList({ lessons, activeId, onPick }: { lessons: Lesson[]; activeId: string; onPick: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {lessons.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => onPick(l.id)}
          className={cn(
            'rounded-2xl border px-4 py-3 text-left transition-all',
            activeId === l.id
              ? 'border-violet-300 bg-violet-50/70 shadow-sm'
              : 'border-zinc-200 bg-white hover:border-violet-200 hover:bg-violet-50/30',
          )}
        >
          <p className="text-[13.5px] font-semibold text-zinc-800">{l.title}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-zinc-400">
            <Clock className="h-3 w-3" /> {l.minutes} min read
          </p>
        </button>
      ))}
    </div>
  );
}

export function LearnView({ onLoadCode }: Props) {
  const [lang, setLang] = useState<'scene' | 'style'>('scene');
  const lessons = lang === 'scene' ? LESSONS : STYLEKIT_LESSONS;
  const [activeId, setActiveId] = useState(lessons[0].id);
  const lesson = lessons.find((l) => l.id === activeId) ?? lessons[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
            <BookOpen className="h-5 w-5 text-violet-600" /> The Learner
          </h1>
          <p className="mt-1 text-[13.5px] text-zinc-500">
            Two languages, one goal: you type, the machine films. Every lesson loads its code into the Studio.
          </p>
        </div>
        <div className="flex rounded-full border bg-white p-1 shadow-sm">
          {(['scene', 'style'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                setLang(l);
                const list = l === 'scene' ? LESSONS : STYLEKIT_LESSONS;
                setActiveId(list[0].id);
              }}
              className={cn(
                'rounded-full px-4 py-1.5 text-[13px] font-medium transition-all',
                lang === l ? 'bg-violet-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-800',
              )}
            >
              {l === 'scene' ? 'SceneLang — videos' : 'StyleKit — styles'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <LessonList lessons={lessons} activeId={lesson.id} onPick={setActiveId} />

        <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="h-56 border-b bg-zinc-50 sm:h-72">
            <MiniThumb code={lesson.code} className="h-full w-full object-contain" />
          </div>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-zinc-900">{lesson.title}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-zinc-600">{lesson.summary}</p>
            <ul className="mt-4 space-y-2">
              {lesson.points.map((p, i) => (
                <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-zinc-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <pre className="mt-5 overflow-x-auto rounded-2xl bg-zinc-50 p-4 font-mono text-[12px] leading-relaxed text-zinc-700">
              {lesson.code}
            </pre>
            <Button
              onClick={() => onLoadCode(lesson.code)}
              className="mt-4 gap-2 rounded-full bg-violet-600 text-white hover:bg-violet-700"
            >
              Try this lesson in the Studio <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
