// Export toolkit — WebM (recorder), MP4 (ffmpeg.wasm), PDF & PPTX (slide stills).

import { renderFrame, sceneSettleMs } from './renderer';
import type { VideoSpec } from './types';

export type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

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
export function sceneStillUrl(spec: VideoSpec, sceneIndex: number): string {
  const c = document.createElement('canvas');
  c.width = spec.width;
  c.height = spec.height;
  const ctx = c.getContext('2d');
  if (ctx && spec.scenes[sceneIndex]) {
    const scene = spec.scenes[sceneIndex];
    renderFrame(ctx as Ctx, spec, scene.startMs + sceneSettleMs(scene));
  }
  return c.toDataURL('image/jpeg', 0.92);
}

/** Render a still at an arbitrary time (used for thumbnails). */
export function stillUrlAt(spec: VideoSpec, timeMs: number, maxWidth = 480): string {
  const c = document.createElement('canvas');
  c.width = spec.width;
  c.height = spec.height;
  const ctx = c.getContext('2d');
  if (ctx) renderFrame(ctx as Ctx, spec, timeMs);
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

export async function exportPdf(spec: VideoSpec, onProgress: (p: number) => void) {
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
    pdf.addImage(sceneStillUrl(spec, i), 'JPEG', 0, 0, spec.width, spec.height);
    onProgress((i + 1) / spec.scenes.length);
    await sleep(24);
  }
  pdf.save('scenelang-slides.pdf');
}

/* ------------------------------- PPTX -------------------------------- */

export async function exportPptx(spec: VideoSpec, onProgress: (p: number) => void) {
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
    slide.addImage({ data: sceneStillUrl(spec, i), x: 0, y: 0, w: wIn, h: hIn });
    onProgress((i + 1) / spec.scenes.length);
    await sleep(24);
  }
  await pptx.writeFile({ fileName: 'scenelang-slides.pptx' });
}

/* ------------------------------- MP4 --------------------------------- */

/**
 * Convert a recorded WebM blob to MP4 using ffmpeg.wasm.
 * Throws if the wasm core cannot be fetched — caller should fall back to WebM.
 */
export async function transcodeWebmToMp4(
  webm: Blob,
  onProgress: (p: number) => void,
): Promise<Blob> {
  const [{ FFmpeg }, { toBlobURL, fetchFile }] = await Promise.all([
    import('@ffmpeg/ffmpeg'),
    import('@ffmpeg/util'),
  ]);
  const ff = new FFmpeg();
  ff.on('progress', ({ progress }) => onProgress(Math.min(1, Math.max(0, progress))));
  const coreBase = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  const workerBase = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.15/dist/umd';
  await ff.load({
    coreURL: await toBlobURL(`${coreBase}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${coreBase}/ffmpeg-core.wasm`, 'application/wasm'),
    classWorkerURL: await toBlobURL(`${workerBase}/814.ffmpeg.js`, 'text/javascript'),
  });
  await ff.writeFile('in.webm', await fetchFile(webm));
  await ff.exec([
    '-i', 'in.webm',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-pix_fmt', 'yuv420p',
    '-movflags', 'faststart',
    'out.mp4',
  ]);
  const data = await ff.readFile('out.mp4');
  return new Blob([data.buffer as ArrayBuffer], { type: 'video/mp4' });
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
