'use client';

// The player: canvas preview, animation + slideshow playback, timeline and exports.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Film,
  Loader2,
  Pause,
  Play,
  Presentation,
  Repeat,
  RotateCcw,
  Clapperboard,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDuration } from '@/lib/scenelang/parser';
import { renderFrame, sceneSettleMs } from '@/lib/scenelang/renderer';
import {
  downloadBlob,
  compileVideoToMp4,
  exportPdf,
  exportPptx,
  pickRecorderMime,
  type Ctx,
} from '@/lib/scenelang/export';
import type { VideoSpec } from '@/lib/scenelang/types';
import { cn } from '@/lib/utils';
import { Timeline } from './timeline';

type Mode = 'anim' | 'slides';
type ExportKind = 'webm' | 'mp4' | 'pdf' | 'pptx';

interface Props {
  spec: VideoSpec;
  exporting: boolean;
  exportLabel: string;
  onExportingChange: (busy: boolean, label: string) => void;
}

export function Player({ spec, exporting, exportLabel, onExportingChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const specRef = useRef(spec);
  specRef.current = spec;

  const [mode, setMode] = useState<Mode>('anim');
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [t, setT] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);

  const playingRef = useRef(false);
  playingRef.current = playing;
  const tRef = useRef(0);
  const loopRef = useRef(true);
  loopRef.current = loop;
  const modeRef = useRef<Mode>('anim');
  modeRef.current = mode;
  const exportingRef = useRef(false);
  exportingRef.current = exporting;
  const recorderRef = useRef<MediaRecorder | null>(null);
  const cancelRef = useRef(false);
  const slideIdxRef = useRef(0);
  slideIdxRef.current = slideIdx;

  /* --------------------------- render loop ---------------------------- */

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      const s = specRef.current;

      if (playingRef.current && modeRef.current === 'anim' && s.totalMs > 0) {
        let nt = tRef.current + dt;
        if (nt >= s.totalMs) {
          if (exportingRef.current) {
            nt = s.totalMs;
            playingRef.current = false;
            setPlaying(false);
            recorderRef.current?.stop();
          } else if (loopRef.current) {
            nt = 0;
          } else {
            nt = s.totalMs;
            playingRef.current = false;
            setPlaying(false);
          }
        }
        tRef.current = nt;
        setT(nt);
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        let time = tRef.current;
        if (modeRef.current === 'slides' && s.scenes.length > 0) {
          const idx = Math.min(slideIdxRef.current, s.scenes.length - 1);
          const scene = s.scenes[idx];
          time = scene.startMs + sceneSettleMs(scene);
        }
        canvas.width = s.width;
        canvas.height = s.height;
        renderFrame(ctx as Ctx, s, time);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // clamp time when spec shrinks
  useEffect(() => {
    if (tRef.current > spec.totalMs) {
      tRef.current = 0;
      setT(0);
    }
  }, [spec.totalMs]);

  /* ------------------------------ controls ---------------------------- */

  const seek = useCallback((ms: number) => {
    tRef.current = Math.max(0, ms);
    setT(tRef.current);
  }, []);

  const togglePlay = useCallback(() => {
    if (specRef.current.scenes.length === 0) return;
    if (modeRef.current === 'slides') {
      setMode('anim');
      playingRef.current = true;
      setPlaying(true);
      return;
    }
    const next = !playingRef.current;
    playingRef.current = next;
    setPlaying(next);
    if (next && tRef.current >= specRef.current.totalMs) seek(0);
  }, [seek]);

  const goScene = useCallback(
    (dir: 1 | -1) => {
      const s = specRef.current;
      if (s.scenes.length === 0) return;
      setMode('slides');
      const idx = Math.min(slideIdxRef.current + dir, s.scenes.length - 1);
      setSlideIdx(Math.max(0, idx));
    },
    [],
  );

  // auto-advance in slideshow mode
  useEffect(() => {
    if (mode !== 'slides' || !autoAdvance || playing || exporting) return;
    if (spec.scenes.length === 0) return;
    const idx = Math.min(slideIdx, spec.scenes.length - 1);
    const dur = spec.scenes[idx].durationMs;
    const id = setTimeout(() => {
      setSlideIdx((i) => (i + 1) % spec.scenes.length);
    }, dur);
    return () => clearTimeout(id);
  }, [mode, autoAdvance, slideIdx, playing, exporting, spec]);

  // keyboard shortcuts (ignored while typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' || el.isContentEditable)) return;
      if (exportingRef.current) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        seek(tRef.current - 1000);
      } else if (e.code === 'ArrowRight') {
        seek(tRef.current + 1000);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        goScene(-1);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        goScene(1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, seek, goScene]);

  /* ------------------------------ exports ----------------------------- */

  const recordWebM = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas || specRef.current.scenes.length === 0) return null;
    const mime = pickRecorderMime();
    if (!mime) {
      toast.error('This browser cannot record video (MediaRecorder missing).');
      return null;
    }
    // rewind and play in real time while recording
    setMode('anim');
    setLoop(false);
    seek(0);
    await new Promise((r) => setTimeout(r, 400));
    const stream = canvas.captureStream(specRef.current.fps);
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
    recorderRef.current = rec;
    const chunks: BlobPart[] = [];
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    const done = new Promise<Blob>((resolve) => {
      rec.onstop = () => resolve(new Blob(chunks, { type: mime }));
    });
    rec.start(200);
    playingRef.current = true;
    setPlaying(true);
    return done;
  }, [seek]);

  const runExport = useCallback(
    async (kind: ExportKind) => {
      if (exportingRef.current) return;
      if (specRef.current.scenes.length === 0) {
        toast.error('Write at least one scene first.');
        return;
      }
      try {
        onExportingChange(true, 'Preparing…');

        if (kind === 'webm') {
          onExportingChange(true, 'Capturing preview (real-time)…');
          const webm = await recordWebM();
          if (!webm) return;
          downloadBlob(webm, 'scenelang-capture.webm');
          toast.success('Preview captured as WebM');
        } else if (kind === 'mp4') {
          onExportingChange(true, 'Compiling your video from code…');
          cancelRef.current = false;
          try {
            const mp4 = await compileVideoToMp4(
              specRef.current,
              (p) => onExportingChange(true, `Compiling video… ${Math.round(p * 100)}%`),
              () => cancelRef.current,
            );
            downloadBlob(mp4, 'scenelang-video.mp4');
            toast.success('Video compiled to MP4 — made entirely from your code');
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg === 'cancelled') {
              toast.info('Compile cancelled');
            } else {
              toast.error('Fast compiler unavailable here — falling back to real-time capture.');
              onExportingChange(true, 'Capturing preview (real-time)…');
              const webm = await recordWebM();
              if (webm) {
                downloadBlob(webm, 'scenelang-capture.webm');
                toast.success('Saved as WebM (browser cannot compile MP4)');
              }
            }
          }
        } else {
          const total = specRef.current.scenes.length;
          onExportingChange(true, `Rendering ${total} slides…`);
          if (kind === 'pdf') {
            await exportPdf(specRef.current, (p) =>
              onExportingChange(true, `Rendering slides… ${Math.round(p * 100)}%`),
            );
            toast.success('Slides saved as PDF');
          } else {
            await exportPptx(specRef.current, (p) =>
              onExportingChange(true, `Rendering slides… ${Math.round(p * 100)}%`),
            );
            toast.success('Slides saved as PPTX');
          }
        }
      } catch (err) {
        console.error(err);
        toast.error('Export failed — try again.');
      } finally {
        recorderRef.current = null;
        cancelRef.current = false;
        onExportingChange(false, '');
      }
    },
    [recordWebM, onExportingChange],
  );

  const scenes = spec.scenes;
  const slideScene = scenes[Math.min(slideIdx, Math.max(0, scenes.length - 1))];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* export status / cancel */}
      {exporting && (
        <div className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-2.5">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-violet-600" />
          <span className="flex-1 truncate text-[13px] font-medium text-violet-800">{exportLabel}</span>
          <button
            type="button"
            onClick={() => (cancelRef.current = true)}
            className="rounded-full border border-violet-300 bg-white px-3 py-1 text-[12px] font-medium text-violet-700 transition-colors hover:bg-violet-100"
          >
            Cancel
          </button>
        </div>
      )}

      {/* mode toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex rounded-lg border bg-zinc-100 p-0.5">
          <button
            type="button"
            onClick={() => setMode('anim')}
            disabled={exporting}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-all',
              mode === 'anim' ? 'bg-white text-violet-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-800',
            )}
          >
            <Film className="h-3.5 w-3.5" /> Animation
          </button>
          <button
            type="button"
            onClick={() => setMode('slides')}
            disabled={exporting}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-all',
              mode === 'slides' ? 'bg-white text-violet-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-800',
            )}
          >
            <Presentation className="h-3.5 w-3.5" /> Slideshow
          </button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" disabled={exporting || scenes.length === 0} className="gap-1.5 bg-violet-600 text-white hover:bg-violet-700">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Save your video</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => runExport('mp4')}>
              <Clapperboard className="mr-2 h-4 w-4 text-violet-600" />
              <div>
                <p className="text-[13px] font-medium">MP4 video — compile</p>
                <p className="text-[11px] text-zinc-500">frame-by-frame from your code, no recording</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => runExport('webm')}>
              <Film className="mr-2 h-4 w-4 text-violet-600" />
              <div>
                <p className="text-[13px] font-medium">WebM quick capture</p>
                <p className="text-[11px] text-zinc-500">real-time fallback capture</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => runExport('pdf')}>
              <FileText className="mr-2 h-4 w-4 text-teal-600" />
              <div>
                <p className="text-[13px] font-medium">PDF slides</p>
                <p className="text-[11px] text-zinc-500">one slide per scene</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => runExport('pptx')}>
              <Camera className="mr-2 h-4 w-4 text-teal-600" />
              <div>
                <p className="text-[13px] font-medium">PPTX slides</p>
                <p className="text-[11px] text-zinc-500">editable deck export</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* canvas stage */}
      <div className="flex min-h-[240px] flex-1 items-center justify-center overflow-hidden rounded-xl border bg-zinc-100/70 p-2 shadow-inner">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          onClick={togglePlay}
          className="max-h-[52vh] max-w-full cursor-pointer rounded-lg shadow-md"
          style={{ width: 'auto', height: 'auto' }}
          aria-label="Video preview"
        />
      </div>

      {/* controls */}
      {mode === 'anim' ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="icon" variant="outline" onClick={() => { seek(0); }} disabled={exporting} aria-label="Restart">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={togglePlay} disabled={exporting || scenes.length === 0} className="bg-violet-600 text-white hover:bg-violet-700" aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <span className="font-mono text-[12px] text-zinc-500">
            {formatDuration(t)} / {formatDuration(spec.totalMs)}
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(1, spec.totalMs)}
            step={50}
            value={t}
            disabled={exporting}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek"
            className="h-1.5 flex-1 cursor-pointer accent-violet-600"
          />
          <label className="flex items-center gap-1.5 text-[12px] text-zinc-500">
            <Repeat className="h-3.5 w-3.5" /> loop
            <Switch checked={loop} onCheckedChange={setLoop} disabled={exporting} />
          </label>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="icon" variant="outline" onClick={() => goScene(-1)} disabled={exporting || slideIdx <= 0} aria-label="Previous slide">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={() => goScene(1)} disabled={exporting || slideIdx >= scenes.length - 1} aria-label="Next slide">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={togglePlay} disabled={exporting || scenes.length === 0} className="gap-1.5">
            <Play className="h-3.5 w-3.5" /> Play as animation
          </Button>
          <span className="text-[12.5px] text-zinc-500">
            slide {scenes.length ? slideIdx + 1 : 0} / {scenes.length}
            {slideScene ? ` · ${slideScene.name}` : ''}
          </span>
          <label className="ml-auto flex items-center gap-1.5 text-[12px] text-zinc-500">
            auto-advance
            <Switch checked={autoAdvance} onCheckedChange={setAutoAdvance} disabled={exporting} />
          </label>
        </div>
      )}

      {/* timeline */}
      <Timeline spec={spec} tMs={mode === 'anim' ? t : (slideScene ? slideScene.startMs : 0)} onSeek={seek} disabled={exporting} />
    </div>
  );
}
