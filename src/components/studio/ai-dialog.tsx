'use client';

// AI code writer — describe, paste an outline, or improve existing code.
// Talks to /api/ai which drafts SceneLang for you.

import { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Mode = 'describe' | 'outline' | 'improve';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCode: string;
  onCode: (code: string) => void;
}

const EXAMPLES = [
  'a 25s smooth ad for a bubble tea shop called CloudSip',
  'a 4-slide investor pitch for a student delivery app',
  'explain the water cycle for 10-year-olds, calm and pretty',
  'a luxury perfume launch teaser, dark and elegant',
];

export function AiDialog({ open, onOpenChange, currentCode, onCode }: Props) {
  const [mode, setMode] = useState<Mode>('describe');
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    if (!prompt.trim() && mode !== 'improve') {
      toast.error('Tell the AI what you want first.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, prompt, currentCode }),
      });
      const data = (await res.json()) as { code?: string; error?: string };
      if (!res.ok || !data.code) {
        throw new Error(data.error ?? 'The AI could not write code right now.');
      }
      onCode(data.code);
      toast.success('AI draft loaded into the editor — tweak anything you like');
      onOpenChange(false);
      setPrompt('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'AI request failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Wand2 className="h-5 w-5 text-violet-600" /> AI code writer
          </DialogTitle>
        </DialogHeader>

        <div className="flex rounded-full border bg-zinc-50 p-1">
          {(
            [
              ['describe', 'Describe it'],
              ['outline', 'Paste outline'],
              ['improve', 'Improve mine'],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'flex-1 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-all',
                mode === m ? 'bg-violet-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-800',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'improve' ? (
          <p className="rounded-2xl bg-violet-50 p-3 text-[12.5px] leading-relaxed text-violet-800">
            The AI will rewrite your current Scene code — smoother pacing, cleaner wording, better scenes.
          </p>
        ) : (
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              mode === 'describe'
                ? 'Describe the video you want…'
                : 'Paste a Markdown outline or bullet points — one scene per heading…'
            }
            className="min-h-28 rounded-2xl"
          />
        )}

        {mode === 'describe' && (
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setPrompt(ex)}
                className="rounded-full border bg-white px-2.5 py-1 text-[11px] text-zinc-600 transition-colors hover:border-violet-300 hover:text-violet-700"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        <Button
          onClick={generate}
          disabled={busy}
          className="w-full gap-2 rounded-full bg-violet-600 text-white hover:bg-violet-700"
        >
          {busy ? <Sparkles className="h-4 w-4 animate-pulse" /> : <Wand2 className="h-4 w-4" />}
          {busy ? 'Writing your SceneLang…' : 'Write my code'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
