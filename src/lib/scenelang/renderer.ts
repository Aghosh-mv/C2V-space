// SceneLang v2 render engine — turns a VideoSpec + time into a canvas frame.
// Every element gets an explicit action list; this engine evaluates each
// action independently (fade / move / zoom / spin / type / stagger / grow...).
// Feel: smooth, swift, premium — long easings, soft shadows, silky transitions.

import type { AssetRef, ElemAction, Scene, SceneElement, VideoSpec } from './types';
import { getTheme, type ThemeTokens } from './themes';

type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

/* ------------------------------ easing ------------------------------ */

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const easeOutQuint = (p: number) => 1 - Math.pow(1 - p, 5);
const easeInQuint = (p: number) => p * p * p * p * p;
const easeInOutQuint = (p: number) =>
  p < 0.5 ? 16 * p * p * p * p * p : 1 - Math.pow(-2 * p + 2, 5) / 2;
const easeOutQuart = (p: number) => 1 - Math.pow(1 - p, 4);
const linear = (p: number) => p;

/** the curve an action declared:  ease out (default) | ease in | ease in-out | linear */
function easeFor(a: ElemAction): (p: number) => number {
  switch (a.ease) {
    case 'linear':
      return linear;
    case 'in':
      return easeInQuint;
    case 'in-out':
      return easeInOutQuint;
    default:
      return easeOutQuint;
  }
}

/* --------------------------- image cache ---------------------------- */

interface ImgEntry {
  img: HTMLImageElement | null;
  ready: boolean;
}
const imageCache = new Map<string, ImgEntry>();

function getImage(src: string): ImgEntry {
  let entry = imageCache.get(src);
  if (!entry) {
    const fresh: { img: HTMLImageElement | null; ready: boolean } = { img: null, ready: false };
    imageCache.set(src, fresh);
    entry = fresh;
    if (/^(https?:\/\/|\/|data:)/.test(src)) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        fresh.ready = true;
      };
      img.onerror = () => {
        fresh.ready = false;
        fresh.img = null;
      };
      img.src = src;
      fresh.img = img;
    }
  }
  return entry;
}

function resolveSrc(src: string, assets: Map<string, AssetRef> | undefined): string {
  if (!assets || /^(https?:\/\/|\/|data:)/.test(src)) return src;
  const asset = assets.get(src.toLowerCase());
  return asset?.dataUrl ?? src;
}

/* ---------------------------- constants ----------------------------- */

const ELEM_CASCADE = 140; // gentle per-element cascade — the only automatic timing

function pathRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function wrapWords(
  ctx: CanvasRenderingContext2D,
  words: string[],
  maxWidth: number,
): { word: string; w: number }[][] {
  const lines: { word: string; w: number }[][] = [[]];
  let lineW = 0;
  const spaceW = ctx.measureText(' ').width;
  for (const word of words) {
    const w = ctx.measureText(word).width;
    const cur = lines[lines.length - 1];
    if (cur.length > 0 && lineW + spaceW + w > maxWidth) {
      lines.push([{ word, w }]);
      lineW = w;
    } else {
      cur.push({ word, w });
      lineW += (cur.length > 1 ? spaceW : 0) + w;
    }
  }
  return lines;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const para of text.split('\n')) {
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    lines.push(line);
  }
  return lines;
}

/* -------------------------- action engine --------------------------- */

export interface ElemState {
  opacity: number;
  dx: number;
  dy: number;
  scale: number;
  rot: number;
  /** typed-character fraction for `type on` (1 = everything) */
  reveal: number;
  unit: 'words' | 'letters' | 'items' | null;
  staggerMs: number;
  /** bars growth 0..1 (1 when no grow action) */
  growP: number;
  /** pie sweep 0..1 (1 when no sweep action) */
  sweepP: number;
  bobY: number;
  breathing: number;
}

const IDENTITY: ElemState = {
  opacity: 1,
  dx: 0,
  dy: 0,
  scale: 1,
  rot: 0,
  reveal: 1,
  unit: null,
  staggerMs: 0,
  growP: 1,
  sweepP: 1,
  bobY: 0,
  breathing: 1,
};

/** Evaluate every explicit action of an element at local time t (ms into the scene). */
export function evalActions(
  actions: ElemAction[],
  elT: number,
  absT: number,
  baseDelay: number,
): ElemState {
  const s: ElemState = { ...IDENTITY };
  let fadeInP = -1; // -1 = no fade-in action → present from the start
  const fadeOuts: { startMs: number; durMs: number }[] = [];
  for (const a of actions) {
    const t = elT - baseDelay - a.startMs;
    switch (a.kind) {
      case 'fade-in': {
        fadeInP = Math.max(fadeInP, t < 0 ? 0 : easeFor(a)(clamp01(t / Math.max(1, a.durMs))));
        break;
      }
      case 'fade-out': {
        fadeOuts.push({ startMs: a.startMs, durMs: a.durMs });
        break;
      }
      case 'move': {
        if (t < 0) break;
        const p = (a.ease === 'linear' || a.loop ? linear : easeFor(a))(clamp01(t / Math.max(1, a.durMs)));
        const d = (a.amount ?? 0) * p;
        if (a.dir === 'up') s.dy -= d;
        else if (a.dir === 'down') s.dy += d;
        else if (a.dir === 'left') s.dx -= d;
        else s.dx += d;
        break;
      }
      case 'zoom': {
        if (t < 0) {
          s.scale *= (a.from ?? 100) / 100;
          break;
        }
        const p = easeFor(a)(clamp01(t / Math.max(1, a.durMs)));
        s.scale *= ((a.from ?? 100) + ((a.to ?? 100) - (a.from ?? 100)) * p) / 100;
        break;
      }
      case 'spin': {
        if (t < 0) break;
        s.rot += (a.amount ?? 0) * easeFor(a)(clamp01(t / Math.max(1, a.durMs)));
        break;
      }
      case 'type': {
        const p = clamp01(t / Math.max(1, a.durMs));
        s.reveal = t < 0 ? 0 : a.ease && a.ease !== 'linear' ? easeFor(a)(p) : p;
        break;
      }
      case 'stagger': {
        s.unit = a.unit ?? 'words';
        s.staggerMs = a.amount ?? 0;
        break;
      }
      case 'grow': {
        s.growP = t < 0 ? 0 : (a.ease === 'in-out' ? easeInOutQuint : easeOutQuart)(clamp01(t / Math.max(1, a.durMs)));
        break;
      }
      case 'sweep': {
        s.sweepP = t < 0 ? 0 : easeFor(a)(clamp01(t / Math.max(1, a.durMs)));
        break;
      }
      case 'bob': {
        if (t >= 0 && a.durMs > 0) s.bobY += (a.amount ?? 0) * Math.sin((absT / a.durMs) * Math.PI * 2);
        break;
      }
      case 'pulse': {
        if (t >= 0 && a.durMs > 0) s.breathing = 1 + Math.sin((absT / a.durMs) * Math.PI * 2) * 0.045;
        break;
      }
      case 'wait':
        break;
    }
  }
  // fade-in defines presence; fade-outs then multiply on top, in order
  s.opacity = fadeInP >= 0 ? fadeInP : 1;
  for (const fo of fadeOuts) {
    const t = elT - baseDelay - fo.startMs;
    if (t >= 0) s.opacity *= 1 - clamp01(t / Math.max(1, fo.durMs));
  }
  return s;
}

/** per-unit progress for staggered text (fade + optional rise, per word/letter/item) */
function unitProgress(actions: ElemAction[], unitT: number): { p: number; dy: number; scale: number } {
  const fade = actions.find((a) => a.kind === 'fade-in');
  const rise = actions.find((a) => a.kind === 'move' && (a.dir === 'up' || a.dir === 'down'));
  const zoomA = actions.find((a) => a.kind === 'zoom');
  const p = (fade ? easeFor(fade) : easeOutQuint)(clamp01(unitT / Math.max(1, fade?.durMs ?? 450)));
  const dy = rise
    ? -(rise.amount ?? 0) * (1 - easeFor(rise)(clamp01(unitT / Math.max(1, rise.durMs))))
    : 0;
  let scale = 1;
  if (zoomA) scale = ((zoomA.from ?? 96) + ((zoomA.to ?? 100) - (zoomA.from ?? 96)) * p) / 100;
  return { p, dy, scale };
}

/* --------------------------- backgrounds ---------------------------- */

function drawAuroraBlobs(ctx: Ctx, spec: VideoSpec, t: number, pulse: boolean) {
  const { width: W, height: H } = spec;
  const blobs: { c: string; x: number; y: number; r: number; sx: number; sy: number }[] = [
    { c: 'rgba(124, 108, 240, 0.34)', x: 0.24, y: 0.22, r: 0.52, sx: 0.9, sy: 0.6 },
    { c: 'rgba(94, 214, 190, 0.28)', x: 0.82, y: 0.68, r: 0.46, sx: 0.7, sy: 0.9 },
    { c: 'rgba(250, 196, 154, 0.26)', x: 0.62, y: 0.12, r: 0.4, sx: 0.5, sy: 0.8 },
  ];
  const breathe = pulse ? 1 + Math.sin(t / 1600) * 0.06 : 1;
  for (const b of blobs) {
    const bx = (b.x + Math.sin(t / (9000 * b.sx)) * 0.05) * W;
    const by = (b.y + Math.cos(t / (11000 * b.sy)) * 0.04) * H;
    const br = b.r * H * breathe;
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    g.addColorStop(0, b.c);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
}

function drawBackground(
  ctx: Ctx,
  spec: VideoSpec,
  T: ThemeTokens,
  scene: Scene,
  absT: number,
  assets: Map<string, AssetRef> | undefined,
) {
  const { width: W, height: H } = spec;
  const bg = scene.elements.find((el): el is Extract<SceneElement, { kind: 'bg' }> => el.kind === 'bg');
  const bgState = bg
    ? evalActions(bg.actions, absT - scene.startMs, absT, 0)
    : IDENTITY;
  const pulse = bg?.actions.some((a) => a.kind === 'pulse') ?? false;

  if (bg?.variant === 'image' && bg.src) {
    ctx.fillStyle = T.bg[0];
    ctx.fillRect(0, 0, W, H);
    const entry = getImage(resolveSrc(bg.src, assets));
    if (entry.ready && entry.img) {
      const img = entry.img;
      const zoom = bgState.scale;
      const cover = Math.max(W / img.width, H / img.height) * zoom;
      const dw = img.width * cover;
      const dh = img.height * cover;
      ctx.save();
      ctx.globalAlpha *= bgState.opacity;
      ctx.drawImage(img, (W - dw) / 2 + bgState.dx, (H - dh) / 2 + bgState.dy, dw, dh);
      ctx.restore();
    } else {
      ctx.setLineDash([12, 10]);
      ctx.strokeStyle = T.dim;
      ctx.lineWidth = 2;
      ctx.strokeRect(W * 0.06, H * 0.06, W * 0.88, H * 0.88);
      ctx.setLineDash([]);
      ctx.fillStyle = T.dim;
      ctx.font = `500 ${H * 0.035}px ${T.font}`;
      ctx.textAlign = 'center';
      ctx.fillText(`bg image — waiting for "${bg.src}"`, W / 2, H / 2);
    }
    return;
  }

  if (!bg || bg.variant === 'gradient') {
    const c0 = bg?.colors?.[0] ?? T.bg[0];
    const c1 = bg?.colors?.[1] ?? T.bg[1];
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, c0);
    g.addColorStop(1, c1);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    if (T.name === 'aurora') drawAuroraBlobs(ctx, spec, absT, pulse);
    if (T.name === 'swiss') {
      const rg = ctx.createRadialGradient(W * 0.85, H * 0.1, 0, W * 0.85, H * 0.1, H * 0.9);
      rg.addColorStop(0, 'rgba(230, 57, 70, 0.05)');
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);
    }
    return;
  }

  if (bg.variant === 'solid') {
    ctx.fillStyle = bg.colors[0] ?? T.bg[0];
    ctx.fillRect(0, 0, W, H);
    return;
  }

  // grid — dotted mesh (aurora) or graph paper (swiss)
  ctx.fillStyle = bg.colors[0] ?? T.bg[0];
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = T.gridLine;
  ctx.fillStyle = T.gridLine;
  ctx.lineWidth = 1;
  if (T.name === 'swiss') {
    const step = W / 16;
    ctx.beginPath();
    for (let x = step; x < W; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    for (let y = step; y < H; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();
  } else {
    const step = Math.max(40, W / 22);
    for (let x = step / 2; x < W; x += step) {
      for (let y = step / 2; y < H; y += step) {
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }
}

function drawBokeh(ctx: Ctx, spec: VideoSpec, t: number, count: number) {
  const { width: W, height: H } = spec;
  for (let i = 0; i < count; i++) {
    const seed = i * 127.3;
    const x = ((Math.sin(seed) * 0.5 + 0.5) * W + Math.sin(t / (6000 + i * 900)) * W * 0.04) % W;
    const y = (((Math.cos(seed * 1.7) * 0.5 + 0.5) * H) - (t / (60 + i * 14)) % (H + 200) + H + 200) % (H + 200) - 100;
    const r = H * (0.05 + ((i * 37) % 10) / 100);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ------------------------------ text -------------------------------- */

function titleSize(ctx: Ctx, spec: VideoSpec, T: ThemeTokens, text: string): number {
  const { width: W, height: H } = spec;
  let size = H * 0.1;
  for (let i = 0; i < 8; i++) {
    ctx.font = `800 ${size}px ${T.font}`;
    const lines = wrapText(ctx, text, W * 0.8);
    const fits = lines.every((l) => ctx.measureText(l).width <= W * 0.8);
    if (fits || size < H * 0.04) return size;
    size *= 0.92;
  }
  return size;
}

function drawTitle(
  ctx: Ctx,
  spec: VideoSpec,
  T: ThemeTokens,
  el: { text: string; actions: ElemAction[] },
  elT: number,
  baseDelay: number,
) {
  const { width: W, height: H } = spec;
  const absT = elT;
  const st = evalActions(el.actions, elT, absT, baseDelay);
  if (st.opacity <= 0.001) return;
  const yBase = H * 0.4;
  const size = titleSize(ctx, spec, T, el.text);
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = T.letterSpacing;
  ctx.fillStyle = T.text;

  const applyTransform = () => {
    ctx.translate(W / 2 + st.dx, yBase + st.dy + st.bobY);
    if (st.rot) ctx.rotate((st.rot * Math.PI) / 180);
    if (st.scale !== 1) ctx.scale(st.scale, st.scale);
  };

  if (st.reveal < 1) {
    // `type on over …` — typewriter with caret
    ctx.font = `800 ${size}px ${T.font}`;
    ctx.textAlign = 'center';
    const shown = el.text.slice(0, Math.ceil(el.text.length * st.reveal));
    ctx.save();
    applyTransform();
    const fullW = ctx.measureText(el.text).width;
    if (fullW > W * 0.8) {
      const sc = (W * 0.8) / fullW;
      ctx.scale(sc, sc);
    }
    ctx.globalAlpha *= st.opacity;
    ctx.fillText(shown, 0, 0);
    const caretA = st.reveal < 1 ? 0.85 : Math.sin(elT / 420) > 0 ? 0.8 : 0;
    if (caretA > 0) {
      const cw = ctx.measureText(shown).width;
      ctx.fillStyle = T.palette[1] ?? T.text;
      ctx.globalAlpha *= caretA;
      ctx.fillRect(cw / 2 + 6, -size * 0.42, Math.max(2, size * 0.05), size * 0.84);
    }
    ctx.restore();
    ctx.letterSpacing = '0px';
    return;
  }

  if (st.unit === 'words' || st.unit === 'letters') {
    // explicit `stagger words|letters by …` — each unit runs fade(+rise) itself
    ctx.font = `800 ${size}px ${T.font}`;
    const units =
      st.unit === 'words'
        ? el.text.split(/\s+/).filter(Boolean)
        : Array.from(el.text);
    const lines = st.unit === 'words' ? wrapWords(ctx, units as string[], W * 0.8) : null;
    const lineHeight = size * 1.2;
    const spaceW = ctx.measureText(' ').width;
    const blockH = (lines ? lines.length : Math.ceil(units.length / 18)) * lineHeight;
    let ui = 0;
    const drawUnit = (word: string, x: number, y: number, w: number, i: number) => {
      const u = unitProgress(el.actions, elT - baseDelay - i * st.staggerMs);
      if (u.p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= st.opacity * u.p;
      ctx.translate(x + (st.unit === 'letters' ? w / 2 : 0), y + u.dy);
      if (u.scale !== 1) ctx.scale(u.scale, u.scale);
      ctx.textAlign = st.unit === 'letters' ? 'center' : 'left';
      ctx.fillText(word, 0, 0);
      ctx.restore();
    };
    if (lines) {
      lines.forEach((line, li) => {
        const lineW = line.reduce((s, w) => s + w.w, 0) + spaceW * (line.length - 1);
        let x = (W - lineW) / 2 + st.dx;
        const y = yBase - blockH / 2 + lineHeight * (li + 0.5) + st.dy + st.bobY;
        for (const item of line) {
          drawUnit(item.word, x, y, item.w, ui++);
          x += item.w + spaceW;
        }
      });
    } else {
      ctx.textAlign = 'center';
      const letters = units as string[];
      const fullW = ctx.measureText(letters.join('')).width;
      const sc = fullW > W * 0.8 ? (W * 0.8) / fullW : 1;
      ctx.save();
      ctx.translate(W / 2 + st.dx, yBase - blockH / 2 + lineHeight / 2 + st.dy + st.bobY);
      ctx.scale(sc, sc);
      letters.forEach((ch, i) => {
        const x = (i - (letters.length - 1) / 2) * size * 0.58;
        drawUnit(ch, x, 0, size * 0.58, i);
      });
      ctx.restore();
    }
    ctx.letterSpacing = '0px';
    return;
  }

  // whole block — smooth
  ctx.font = `800 ${size}px ${T.font}`;
  ctx.textAlign = 'center';
  const lines = wrapText(ctx, el.text, W * 0.8);
  const lineHeight = size * 1.2;
  const blockH = lines.length * lineHeight;
  ctx.save();
  ctx.globalAlpha *= st.opacity;
  applyTransform();
  ctx.translate(0, -blockH / 2 + lineHeight / 2);
  lines.forEach((line, i) => ctx.fillText(line, 0, i * lineHeight));
  ctx.restore();
  ctx.letterSpacing = '0px';
}

function drawSubtitle(
  ctx: Ctx,
  spec: VideoSpec,
  T: ThemeTokens,
  el: { text: string; actions: ElemAction[] },
  elT: number,
  baseDelay: number,
  hasPie = false,
) {
  const { width: W, height: H } = spec;
  const st = evalActions(el.actions, elT, elT, baseDelay);
  if (st.opacity <= 0.001) return;
  const y = (hasPie ? 0.88 : 0.56) * H + st.dy + st.bobY;
  const size = H * 0.05;
  ctx.font = `500 ${size}px ${T.font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '1.5px';
  ctx.save();
  ctx.translate(W / 2 + st.dx, y);
  if (st.scale !== 1) ctx.scale(st.scale, st.scale);

  if (st.reveal < 1) {
    const shown = el.text.slice(0, Math.ceil(el.text.length * st.reveal));
    ctx.globalAlpha *= st.opacity * 0.95;
    ctx.fillStyle = T.dim;
    ctx.fillText(shown, 0, 0);
    const cw = ctx.measureText(shown).width;
    ctx.fillStyle = T.palette[1] ?? T.text;
    ctx.globalAlpha *= Math.sin(elT / 380) > 0 ? 0.7 : 0;
    ctx.fillRect(cw / 2 + 8, -size * 0.4, 2.5, size * 0.8);
    ctx.restore();
    ctx.letterSpacing = '0px';
    return;
  }

  ctx.globalAlpha *= st.opacity * 0.95;
  ctx.fillStyle = T.dim;
  ctx.fillText(el.text, 0, 0);
  ctx.restore();
  ctx.letterSpacing = '0px';
}

function drawBodyText(
  ctx: Ctx,
  spec: VideoSpec,
  T: ThemeTokens,
  el: { text: string; actions: ElemAction[] },
  elT: number,
  baseDelay: number,
  hasSubtitle: boolean,
) {
  const { width: W, height: H } = spec;
  const st = evalActions(el.actions, elT, elT, baseDelay);
  if (st.opacity <= 0.001) return;
  const size = H * 0.042;
  const y = (hasSubtitle ? 0.7 : 0.52) * H;
  ctx.font = `400 ${size}px ${T.font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = wrapText(ctx, el.text, W * 0.76);
  const lineHeight = size * 1.55;
  ctx.save();
  ctx.globalAlpha *= st.opacity * 0.92;
  ctx.translate(W / 2 + st.dx, y + st.dy + st.bobY);
  if (st.scale !== 1) ctx.scale(st.scale, st.scale);
  ctx.fillStyle = T.dim;
  lines.forEach((line, i) => ctx.fillText(line, 0, -((lines.length - 1) * lineHeight) / 2 + i * lineHeight));
  ctx.restore();
}

/* --------------------------- dialogue lines -------------------------- */

function drawLines(
  ctx: Ctx,
  spec: VideoSpec,
  T: ThemeTokens,
  el: { name: string; items: string[]; actions: ElemAction[] },
  localT: number,
  sceneDur: number,
  baseDelay: number,
  assets: Map<string, AssetRef> | undefined,
) {
  const st = evalActions(el.actions, localT, localT, baseDelay);
  if (st.opacity <= 0.001) return;
  const items =
    el.items.length > 0
      ? el.items
      : (assets?.get(el.name.toLowerCase())?.content ?? '')
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
          .slice(0, 12);
  if (items.length === 0) return;
  const { width: W, height: H } = spec;
  const slice = Math.max(900, (sceneDur - baseDelay) / items.length);
  const idx = clamp(Math.floor((localT - baseDelay) / slice), 0, items.length - 1);
  const inP = clamp01((localT - baseDelay - idx * slice) / 340);
  const outP = clamp01((localT - baseDelay - idx * slice - (slice - 260)) / 260);
  const alpha = st.opacity * inP * (1 - outP);
  if (alpha <= 0.01) return;
  const size = H * 0.046;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `500 ${size}px ${T.font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = wrapText(ctx, items[idx], W * 0.78);
  const lineHeight = size * 1.45;
  ctx.translate(W / 2 + st.dx, H * 0.82 + st.dy);
  lines.forEach((line, i) => {
    ctx.fillStyle = T.text;
    ctx.font = `600 ${size}px ${T.font}`;
    ctx.fillText(line, 0, -((lines.length - 1) * lineHeight) / 2 + i * lineHeight);
  });
  // speaker tick
  ctx.fillStyle = T.palette[1] ?? T.text;
  pathRoundRect(ctx, -W * 0.02, lineHeight * (lines.length - 1) + size, Math.min(90, W * 0.12), Math.max(3, H * 0.006), 99);
  ctx.fill();
  ctx.restore();
}

/* ------------------------------ charts ------------------------------ */

function drawBars(
  ctx: Ctx,
  spec: VideoSpec,
  T: ThemeTokens,
  el: { data: { label: string; value: number }[]; actions: ElemAction[] },
  elT: number,
  baseDelay: number,
) {
  const { width: W, height: H } = spec;
  const st = evalActions(el.actions, elT, elT, baseDelay);
  if (st.opacity <= 0.001) return;
  const data = el.data.slice(0, 8);
  if (data.length === 0) return;
  const maxV = Math.max(...data.map((d) => d.value), 0.0001);
  const top = H * 0.52;
  const bottom = H * 0.85;
  const margin = W * 0.12;
  const areaW = W - margin * 2;
  const slotW = areaW / data.length;
  const barW = slotW * 0.5;

  ctx.strokeStyle = T.gridLine;
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    const gy = bottom - ((bottom - top) / 3) * i;
    ctx.beginPath();
    ctx.moveTo(margin, gy);
    ctx.lineTo(W - margin, gy);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(22,22,29,0.25)';
  ctx.beginPath();
  ctx.moveTo(margin, bottom);
  ctx.lineTo(W - margin, bottom);
  ctx.stroke();

  const stagger = st.unit === 'items' ? st.staggerMs : 0;
  data.forEach((d, i) => {
    const it = elT - baseDelay - i * stagger;
    const itemP = stagger === 0 ? 1 : clamp01(it / 450);
    const p = st.growP * itemP;
    if (p <= 0) return;
    const h = (d.value / maxV) * (bottom - top) * p;
    const x = margin + slotW * i + (slotW - barW) / 2 + st.dx;
    const y = bottom - h;
    const color = T.palette[i % T.palette.length];
    ctx.save();
    ctx.globalAlpha *= st.opacity;
    if (T.glow) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 22;
    } else {
      ctx.shadowColor = 'rgba(22, 22, 29, 0.20)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;
    }
    ctx.fillStyle = color;
    pathRoundRect(ctx, x, y + st.dy, barW, h, Math.min(12, barW / 2.4));
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha *= st.opacity * itemP;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = T.text;
    ctx.font = `700 ${H * 0.032}px ${T.font}`;
    ctx.fillText(String(d.value), x + barW / 2, y - H * 0.03 + st.dy);
    ctx.fillStyle = T.dim;
    ctx.font = `600 ${H * 0.03}px ${T.font}`;
    ctx.fillText(d.label, x + barW / 2, bottom + H * 0.045 + st.dy);
    ctx.restore();
  });
}

function drawPie(
  ctx: Ctx,
  spec: VideoSpec,
  T: ThemeTokens,
  el: { data: { label: string; value: number }[]; actions: ElemAction[] },
  elT: number,
  baseDelay: number,
) {
  const { width: W, height: H } = spec;
  const st = evalActions(el.actions, elT, elT, baseDelay);
  if (st.opacity <= 0.001) return;
  const data = el.data.slice(0, 6);
  if (data.length === 0) return;
  const total = data.reduce((s, d) => s + Math.max(0, d.value), 0) || 1;
  const cx = W * 0.36 + st.dx;
  const cy = H * 0.55 + st.dy;
  const r = Math.min(H * 0.21, W * 0.18) * st.scale * st.breathing;
  const stagger = st.unit === 'items' ? st.staggerMs : 0;

  let start = -Math.PI / 2 + (st.rot * Math.PI) / 180;
  const ringR = r * 0.79;
  const ringW = r * 0.42;
  data.forEach((d, i) => {
    const it = elT - baseDelay - i * stagger;
    const itemP = stagger === 0 ? 1 : clamp01(it / 500);
    const sweep = (Math.max(0, d.value) / total) * Math.PI * 2 * st.sweepP * itemP;
    if (sweep <= 0) return;
    const color = T.palette[i % T.palette.length];
    ctx.save();
    ctx.globalAlpha *= st.opacity * 0.94;
    if (T.glow) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
    } else {
      ctx.shadowColor = 'rgba(22,22,29,0.18)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 5;
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = ringW;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, start, start + sweep);
    ctx.stroke();
    ctx.restore();
    start += sweep;
  });

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  data.forEach((d, i) => {
    const it = elT - baseDelay - 300 - i * (stagger || 120);
    const lp = easeOutQuint(clamp01(it / 600));
    if (lp <= 0) return;
    const color = T.palette[i % T.palette.length];
    const y = H * 0.42 + i * H * 0.085;
    ctx.save();
    ctx.globalAlpha *= st.opacity * lp;
    ctx.fillStyle = color;
    pathRoundRect(ctx, W * 0.6, y - H * 0.016, H * 0.032, H * 0.032, 4);
    ctx.fill();
    ctx.fillStyle = T.text;
    ctx.font = `600 ${H * 0.034}px ${T.font}`;
    ctx.fillText(d.label, W * 0.6 + H * 0.05, y);
    const pct = Math.round((Math.max(0, d.value) / total) * 100);
    ctx.fillStyle = T.dim;
    ctx.font = `500 ${H * 0.03}px ${T.font}`;
    ctx.fillText(`${pct}%`, W * 0.6 + H * 0.05 + ctx.measureText(d.label).width + H * 0.03, y);
    ctx.restore();
  });
}

/* --------------------------- image & sprite -------------------------- */

function drawImageEl(
  ctx: Ctx,
  spec: VideoSpec,
  T: ThemeTokens,
  el: { src: string; actions: ElemAction[]; sprite: boolean },
  elT: number,
  baseDelay: number,
  assets: Map<string, AssetRef> | undefined,
) {
  const st = evalActions(el.actions, elT, elT, baseDelay);
  if (st.opacity <= 0.001) return;
  const { width: W, height: H } = spec;
  const src = resolveSrc(el.src, assets);
  const entry = getImage(src);
  const w = el.sprite ? H * 0.42 : W * 0.58;
  const h = el.sprite ? H * 0.42 : H * 0.5;
  const x = (W - w) / 2 + st.dx;
  const y = H * 0.52 - h / 2 + st.dy + st.bobY;
  const radius = el.sprite ? h / 2 : H * 0.035;

  ctx.save();
  ctx.globalAlpha *= st.opacity;
  ctx.translate(x + w / 2, y + h / 2);
  if (st.rot) ctx.rotate((st.rot * Math.PI) / 180);
  if (st.scale !== 1) ctx.scale(st.scale, st.scale);
  ctx.translate(-w / 2, -h / 2);

  if (entry.ready && entry.img) {
    const img = entry.img;
    if (el.sprite) {
      const fit = Math.min(w / img.width, h / img.height);
      const dw = img.width * fit;
      const dh = img.height * fit;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } else {
      const cover = Math.max(w / img.width, h / img.height);
      const dw = img.width * cover;
      const dh = img.height * cover;
      ctx.shadowColor = 'rgba(22,22,29,0.22)';
      ctx.shadowBlur = 26;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = '#ffffff';
      pathRoundRect(ctx, 0, 0, w, h, radius);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.save();
      pathRoundRect(ctx, 5, 5, w - 10, h - 10, Math.max(2, radius - 4));
      ctx.clip();
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 1.5;
      pathRoundRect(ctx, 0, 0, w, h, radius);
      ctx.stroke();
    }
  } else {
    // graceful placeholder
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = T.dim;
    ctx.lineWidth = 2;
    pathRoundRect(ctx, 0, 0, w, h, el.sprite ? radius : radius);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = T.dim;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `500 ${H * 0.032}px ${T.font}`;
    ctx.fillText(el.sprite ? `sprite ${el.src}` : `image ${el.src}`, w / 2, h / 2);
  }
  ctx.restore();
}

function drawShape(
  ctx: Ctx,
  spec: VideoSpec,
  T: ThemeTokens,
  el: { variant: string; actions: ElemAction[] },
  elT: number,
  absT: number,
  baseDelay: number,
) {
  const st = evalActions(el.actions, elT, absT, baseDelay);
  if (st.opacity <= 0.001) return;
  const { width: W, height: H } = spec;
  ctx.save();
  ctx.globalAlpha *= st.opacity;

  if (el.variant === 'circle') {
    const cx = W * 0.5 + Math.sin(absT / 2600) * W * 0.015 + st.dx;
    const cy = H * 0.42 + st.dy;
    const r = H * 0.3 * st.breathing * st.scale;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    if (T.name === 'swiss') {
      g.addColorStop(0, 'rgba(230, 57, 70, 0.10)');
      g.addColorStop(1, 'rgba(230, 57, 70, 0)');
    } else {
      g.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
      g.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    if (T.name === 'aurora') {
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  } else if (el.variant === 'ring') {
    ctx.translate(W / 2 + st.dx, H * 0.44 + st.dy);
    ctx.rotate((st.rot * Math.PI) / 180);
    ctx.strokeStyle = T.name === 'swiss' ? 'rgba(17,17,17,0.3)' : 'rgba(124,108,240,0.4)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, H * 0.26 * st.scale * st.breathing, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    const inset = W * 0.05;
    ctx.strokeStyle = T.name === 'swiss' ? 'rgba(17,17,17,0.25)' : 'rgba(255,255,255,0.85)';
    ctx.fillStyle = T.name === 'swiss' ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0.30)';
    ctx.lineWidth = 2;
    pathRoundRect(ctx, inset + st.dx, H * 0.08 + st.dy, W - inset * 2, H * 0.84, H * 0.04);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/* ----------------------------- scene -------------------------------- */

function drawSceneElements(
  ctx: Ctx,
  spec: VideoSpec,
  T: ThemeTokens,
  scene: Scene,
  localT: number,
  absT: number,
  assets: Map<string, AssetRef> | undefined,
) {
  const content = scene.elements.filter((el) => el.kind !== 'bg');
  const kinds = new Set(content.map((el) => el.kind));
  let i = 0;
  for (const el of content) {
    const baseDelay = i * ELEM_CASCADE;
    const elT = localT;
    switch (el.kind) {
      case 'title':
        drawTitle(ctx, spec, T, el, elT, baseDelay);
        break;
      case 'subtitle':
        drawSubtitle(ctx, spec, T, el, elT, baseDelay, kinds.has('pie'));
        break;
      case 'text':
        drawBodyText(ctx, spec, T, el, elT, baseDelay, kinds.has('subtitle'));
        break;
      case 'bars':
        drawBars(ctx, spec, T, el, elT, baseDelay);
        break;
      case 'pie':
        drawPie(ctx, spec, T, el, elT, baseDelay);
        break;
      case 'lines':
        drawLines(ctx, spec, T, el, localT, scene.durationMs, baseDelay, assets);
        break;
      case 'image':
        drawImageEl(ctx, spec, T, { ...el, sprite: false }, elT, baseDelay, assets);
        break;
      case 'sprite':
        drawImageEl(ctx, spec, T, { ...el, sprite: true }, elT, baseDelay, assets);
        break;
      case 'shape':
        drawShape(ctx, spec, T, el, elT, absT, baseDelay);
        break;
    }
    i++;
  }
}

function drawTitleBar(ctx: Ctx, spec: VideoSpec, T: ThemeTokens, scene: Scene, localT: number) {
  if (!T.titleBar) return;
  const title = scene.elements.find((el) => el.kind === 'title');
  if (!title) return;
  const p = easeOutQuint(clamp01((localT - 500) / 700));
  if (p <= 0) return;
  const { width: W, height: H } = spec;
  const y = H * 0.4 + H * 0.075;
  const w = W * 0.09 * p;
  ctx.save();
  ctx.globalAlpha *= 0.9;
  ctx.fillStyle = T.palette[1];
  pathRoundRect(ctx, W / 2 - w / 2, y, w, Math.max(4, H * 0.008), 99);
  ctx.fill();
  ctx.restore();
}

function drawScene(
  ctx: Ctx,
  spec: VideoSpec,
  scene: Scene,
  localT: number,
  alphaMul: number,
  settled: boolean,
  T: ThemeTokens,
  assets: Map<string, AssetRef> | undefined,
) {
  const absT = scene.startMs + localT;
  const tr = scene.transition;
  const transMs = tr.kind === 'cut' ? 0 : tr.ms;
  const p = settled || transMs === 0 ? 1 : easeInOutQuint(clamp01(localT / transMs));
  const { width: W, height: H } = spec;

  ctx.save();
  ctx.globalAlpha = alphaMul;

  if (!settled && p < 1 && transMs > 0) {
    switch (tr.kind) {
      case 'crossfade':
        ctx.globalAlpha = alphaMul * p;
        break;
      case 'slide-left':
        ctx.globalAlpha = alphaMul * Math.min(1, p * 1.4);
        ctx.translate((1 - p) * W * 0.12, 0);
        break;
      case 'slide-right':
        ctx.globalAlpha = alphaMul * Math.min(1, p * 1.4);
        ctx.translate(-(1 - p) * W * 0.12, 0);
        break;
      case 'zoom':
        ctx.globalAlpha = alphaMul * p;
        ctx.translate(W / 2, H / 2);
        ctx.scale(0.965 + 0.035 * p, 0.965 + 0.035 * p);
        ctx.translate(-W / 2, -H / 2);
        break;
      default:
        break;
    }
  }

  drawBackground(ctx, spec, T, scene, absT, assets);
  if (T.particles > 0) drawBokeh(ctx, spec, absT, T.particles);
  drawSceneElements(ctx, spec, T, scene, localT, absT, assets);
  drawTitleBar(ctx, spec, T, scene, localT);

  ctx.restore();
}

/* ----------------------------- overlays ------------------------------ */

function drawOverlays(ctx: Ctx, spec: VideoSpec, T: ThemeTokens) {
  const { width: W, height: H } = spec;
  if (T.scanlines) {
    ctx.fillStyle = 'rgba(255,255,255,0.025)';
    for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
  }
  if (T.vignette !== 'none') {
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.55, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, T.vignette);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
}

/* ------------------------------ public ------------------------------- */

export function activeSceneIndex(spec: VideoSpec, t: number): number {
  const scenes = spec.scenes;
  for (let i = scenes.length - 1; i >= 0; i--) {
    if (t >= scenes[i].startMs) return i;
  }
  return 0;
}

/** Render one frame at absolute time tMs. `assets` resolves imported file names. */
export function renderFrame(
  ctx: Ctx,
  spec: VideoSpec,
  tMs: number,
  assets?: Map<string, AssetRef>,
) {
  const T = getTheme(spec.theme);
  const { width: W, height: H } = spec;
  const t = clamp(tMs, 0, Math.max(1, spec.totalMs));

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = T.bg[0];
  ctx.fillRect(0, 0, W, H);

  if (spec.scenes.length === 0) {
    return; // blank canvas — the app shows its own empty-state overlay
  }

  const idx = activeSceneIndex(spec, t);
  const scene = spec.scenes[idx];
  const localT = t - scene.startMs;

  const prevDrawn = idx > 0 && scene.transition.kind !== 'cut' && localT < scene.transition.ms;
  if (prevDrawn) {
    const prev = spec.scenes[idx - 1];
    drawScene(ctx, spec, prev, prev.durationMs, 1 - easeInOutQuint(clamp01(localT / scene.transition.ms)), true, T, assets);
  }
  drawScene(ctx, spec, scene, localT, 1, false, T, assets);
  drawOverlays(ctx, spec, T);
}

/** Time when every explicit action in the scene has finished (for slideshow frames). */
export function sceneSettleMs(scene: Scene): number {
  let maxEnd = 700;
  scene.elements.forEach((el, i) => {
    const baseDelay = i * ELEM_CASCADE;
    if (el.kind === 'bg') return;
    const actions: ElemAction[] = el.actions;
    if (actions.length === 0) {
      maxEnd = Math.max(maxEnd, baseDelay + 350);
      return;
    }
    for (const a of actions) {
      let end = baseDelay + a.startMs + a.durMs;
      if (a.kind === 'stagger') {
        const count =
          a.unit === 'letters'
            ? 24
            : a.unit === 'items'
              ? 8
              : 'text' in el
                ? el.text.split(/\s+/).length
                : 8;
        end = baseDelay + count * (a.amount ?? 0) + 600;
      }
      if (a.kind === 'type' && 'text' in el) {
        end = baseDelay + a.startMs + a.durMs;
      }
      if (a.kind === 'pulse' || a.kind === 'bob') continue; // loops never settle
      maxEnd = Math.max(maxEnd, end);
    }
  });
  return Math.min(Math.max(maxEnd + 250, 700), Math.max(700, scene.durationMs - 60));
}
