'use client';

// History — every code session gets an id. Pull any of them back into the
// editor by typing:  inimportcode :<session-id>

import { useState } from 'react';
import { Copy, History, Trash2, CornerDownLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { type CodeSession } from '@/lib/scenelang/history';
import { MiniThumb } from './mini-thumb';

interface Props {
  sessions: CodeSession[];
  version: number;
  onLoad: (code: string, kind: 'scene' | 'style') => void;
  onDelete: (id: string) => void;
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

function firstLine(code: string): string {
  const line = code.split('\n').map((l) => l.trim()).find((l) => l && !l.startsWith('//'));
  return (line ?? 'empty session').slice(0, 72);
}

export function HistoryView({ sessions, version, onLoad, onDelete }: Props) {
  void version;
  const [filter, setFilter] = useState<'all' | 'scene' | 'style'>('all');
  const shown = sessions.filter((s) => filter === 'all' || s.kind === filter);

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(`inimportcode :${id}`);
      toast.success(`Copied — paste it in the editor to pull this code back`);
    } catch {
      toast.error('Clipboard blocked — copy it manually: ' + id);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
            <History className="h-5 w-5 text-violet-600" /> History
          </h1>
          <p className="mt-1 text-[13.5px] text-zinc-500">
            Every save point of your code. Type <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[12px]">inimportcode :id</code> in the editor to pull one back.
          </p>
        </div>
        <div className="flex rounded-full border bg-white p-1 shadow-sm">
          {(['all', 'scene', 'style'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={
                'rounded-full px-3.5 py-1.5 text-[12.5px] font-medium capitalize transition-all ' +
                (filter === f ? 'bg-violet-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-800')
              }
            >
              {f === 'all' ? 'everything' : `${f} code`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((session) => (
          <div
            key={session.id}
            className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="h-36 border-b bg-zinc-50">
              {session.kind === 'scene' ? (
                <MiniThumb code={session.code} />
              ) : (
                <pre className="h-full overflow-hidden p-4 font-mono text-[10.5px] leading-relaxed text-zinc-500">
                  {session.code.slice(0, 220)}
                </pre>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <span
                  className={
                    'rounded-full px-2 py-0.5 text-[10.5px] font-semibold ' +
                    (session.kind === 'scene' ? 'bg-violet-100 text-violet-700' : 'bg-teal-100 text-teal-700')
                  }
                >
                  {session.kind}
                </span>
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11.5px] font-semibold text-zinc-700">
                  {session.id}
                </code>
                <span className="ml-auto text-[11px] text-zinc-400">{timeAgo(session.savedAt)}</span>
              </div>
              <p className="mt-2 truncate text-[13px] text-zinc-600">{firstLine(session.code)}</p>
              <div className="mt-3 flex gap-1.5">
                <Button
                  size="sm"
                  className="h-8 gap-1.5 rounded-full bg-violet-600 text-white hover:bg-violet-700"
                  onClick={() => onLoad(session.code, session.kind)}
                >
                  <CornerDownLeft className="h-3.5 w-3.5" /> Load
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 rounded-full"
                  onClick={() => copyId(session.id)}
                >
                  <Copy className="h-3.5 w-3.5" /> Copy directive
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="ml-auto h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600"
                  aria-label={`Delete session ${session.id}`}
                  onClick={() => onDelete(session.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {shown.length === 0 && (
          <p className="col-span-full rounded-3xl border border-dashed bg-white/60 px-4 py-10 text-center text-[13.5px] text-zinc-400">
            No sessions yet — write some code and it will save itself here.
          </p>
        )}
      </div>
    </div>
  );
}
