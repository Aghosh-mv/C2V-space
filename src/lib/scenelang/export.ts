// Export toolkit — WebM (recorder), MP4 (ffmpeg.wasm), PDF & PPTX (slide stills).

import { renderFrame, sceneSettleMs } from './renderer';
import type { AssetRef, VideoSpec } from './types';

export type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

export function toAssetMap(assets?: AssetRef[]): Map<string, AssetRef> | undefined {
  return assets && assets.length > 0 ? new Map(assets.map((a) => [a.name.toLowerCase(), a])) : undefined;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Render a single still of a scene (fully settled) and return a JPEG data URL. */
export function sceneStillUrl(spec: VideoSpec, sceneIndex: number, assets?: AssetRef[]): string {
  const c = document.createElement('canvas');
  c.width = spec.width;
  c.height = spec.height;
  const ctx = c.getContext('2d');
  if (ctx && spec.scenes[sceneIndex]) {
    const scene = spec.scenes[sceneIndex];
    renderFrame(ctx as Ctx, spec, scene.startMs + sceneSettleMs(scene), toAssetMap(assets));
  }
  return c.toDataURL('image/jpeg', 0.92);
}

/** Render a still at an arbitrary time (used for thumbnails). */
export function stillUrlAt(spec: VideoSpec, timeMs: number, maxWidth = 480, assets?: AssetRef[]): string {
  const c = document.createElement('canvas');
  c.width = spec.width;
  c.height = spec.height;
  const ctx = c.getContext('2d');
  if (ctx) renderFrame(ctx as Ctx, spec, timeMs, toAssetMap(assets));
  if (c.width > maxWidth) {
    const scale = maxWidth / c.width;
    const small = document.createElement('canvas');
    small.width = maxWidth;
    small.height = Math.round(c.height * scale);
    const sctx = small.getContext('2d');
    sctx?.drawImage(c, 0, 0, small.width, small.height);
    return small.toDataURL('image/jpeg', 0.85);
  }
  return c.toDataURL('image/jpeg', 0.85);
}

/* ------------------------------- PDF -------------------------------- */

export async function exportPdf(spec: VideoSpec, onProgress: (p: number) => void, assets?: AssetRef[]) {
  const { jsPDF } = await import('jspdf');
  const landscape = spec.width >= spec.height;
  const pdf = new jsPDF({
    orientation: landscape ? 'landscape' : 'portrait',
    unit: 'px',
    format: [spec.width, spec.height],
    hotfixes: ['px_scaling'],
    compress: true,
  });
  for (let i = 0; i < spec.scenes.length; i++) {
    if (i > 0) pdf.addPage([spec.width, spec.height], landscape ? 'landscape' : 'portrait');
    pdf.addImage(sceneStillUrl(spec, i, assets), 'JPEG', 0, 0, spec.width, spec.height);
    onProgress((i + 1) / spec.scenes.length);
    await sleep(24);
  }
  pdf.save('scenelang-slides.pdf');
}

/* ------------------------------- PPTX -------------------------------- */

export async function exportPptx(spec: VideoSpec, onProgress: (p: number) => void, assets?: AssetRef[]) {
  const mod = await import('pptxgenjs');
  const PptxGenJS = mod.default;
  const pptx = new PptxGenJS();
  const wIn = spec.width / 96;
  const hIn = spec.height / 96;
  pptx.defineLayout({ name: 'SLANG', width: wIn, height: hIn });
  pptx.layout = 'SLANG';
  pptx.title = 'SceneLang Slides';
  for (let i = 0; i < spec.scenes.length; i++) {
    const slide = pptx.addSlide();
    slide.addImage({ data: sceneStillUrl(spec, i, assets), x: 0, y: 0, w: wIn, h: hIn });
    onProgress((i + 1) / spec.scenes.length);
    await sleep(24);
  }
  await pptx.writeFile({ fileName: 'scenelang-slides.pptx' });
}

/* --------------------------- MP4 compiler ---------------------------- */

function pickAvcCodec(width: number, height: number): string {
  if (width <= 1280 && height <= 720) return 'avc1.42001f'; // baseline 3.1
  return 'avc1.640028'; // high 4.0 — 1080p class
}

/**
 * COMPILE the timeline into a real .mp4 file — deterministic, frame by frame,
 * faster than real-time. This is code becoming video, not a screen recording.
 * Requires the WebCodecs API (Chrome, Edge, Safari 16.4+).
 */
export async function compileVideoToMp4(
  spec: VideoSpec,
  onProgress: (p: number) => void,
  shouldCancel: () => boolean,
  assets?: AssetRef[],
): Promise<Blob> {
  if (typeof VideoEncoder === 'undefined' || typeof VideoFrame === 'undefined') {
    throw new Error('WebCodecs unsupported');
  }
  const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');

  const width = spec.width - (spec.width % 2);
  const height = spec.height - (spec.height % 2);
  const codec = pickAvcCodec(width, height);
  const config: VideoEncoderConfig = {
    codec,
    width,
    height,
    bitrate: Math.min(12_000_000, Math.max(3_000_000, width * height * 5)),
    framerate: spec.fps,
  };
  const support = await VideoEncoder.isConfigSupported(config);
  if (!support.supported) throw new Error('encoder config unsupported');

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width, height },
    fastStart: 'in-memory',
  });

  let encoderError: Error | null = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => {
      encoderError = e;
    },
  });
  encoder.configure(config);

  const canvas = document.createElement('canvas');
  canvas.width = spec.width;
  canvas.height = spec.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no 2d context');

  const totalFrames = Math.max(1, Math.ceil((spec.totalMs / 1000) * spec.fps));
  const usPerFrame = 1_000_000 / spec.fps;
  const keyEvery = Math.max(1, spec.fps * 2);

  for (let f = 0; f < totalFrames; f++) {
    if (shouldCancel()) {
      encoder.close();
      throw new Error('cancelled');
    }
    if (encoderError) throw encoderError;

    renderFrame(ctx as Ctx, spec, (f * 1000) / spec.fps, toAssetMap(assets));
    const frame = new VideoFrame(canvas, {
      timestamp: Math.round(f * usPerFrame),
      duration: Math.round(usPerFrame),
    });
    encoder.encode(frame, { keyFrame: f % keyEvery === 0 });
    frame.close();

    // gentle backpressure + UI breathing room
    if (encoder.encodeQueueSize > 24 || f % 6 === 0) {
      onProgress(f / totalFrames);
      await new Promise((r) => setTimeout(r, 0));
      while (encoder.encodeQueueSize > 24) {
        await new Promise((r) => setTimeout(r, 4));
      }
    }
  }

  onProgress(1);
  await encoder.flush();
  encoder.close();
  muxer.finalize();
  const buffer = (muxer.target as ArrayBufferTarget).buffer;
  return new Blob([buffer], { type: 'video/mp4' });
}

/* ------------------------------- WebM -------------------------------- */

export function pickRecorderMime(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  for (const m of candidates) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return null;
}
