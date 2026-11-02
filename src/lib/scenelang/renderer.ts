// SceneLang render engine — turns a VideoSpec + time into a canvas frame.
// Feel: smooth, swift, premium — long easings, soft shadows, silky crossfades.

import type { Scene, SceneElement, VideoSpec } from './types';
import { getTheme, type ThemeTokens } from './themes';

type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

/* ------------------------------ easing ------------------------------ */

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const easeOutQuint = (p: number) => 1 - Math.pow(1 - p, 5);
const easeInOutQuint = (p: number) =>
  p < 0.5 ? 16 * p * p * p * p * p : 1 - Math.pow(-2 * p + 2, 5) / 2;
const easeOutQuart = (p: number) => 1 - Math.pow(1 - p, 4);

/* --------------------------- image cache ---------------------------- */

interface ImgEntry {
  img: HTMLImageElement | null;
  ready: boolean;
}
const imageCache = new Map<string, ImgEntry>();

function getImage(src: string): ImgEntry {
  let entry = imageCache.get(src);
  if (!entry) {
    entry = { img: null, ready: false };
    imageCache.set(src, entry);
    if (/^https?:\/\//.test(src) || src.startsWith('/')) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        entry.ready = true;
      };
      img.onerror = () => {
        entry.ready = false;
        entry.img = null;
      };
      img.src = src;
      entry.img = img;
    }
  }
  return entry;
}

/* ---------------------------- constants ----------------------------- */

const TRANSITION_MS = 850; // silky scene crossfade
const ELEM_DELAY = 260;
const ELEM_STAGGER = 220;
const ELEM_DUR = 800;

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

/* --------------------------- backgrounds ---------------------------- */

function drawAuroraBlobs(ctx: Ctx, spec: VideoSpec, T: ThemeTokens, t: number, pulse: boolean) {
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
) {
  const { width: W, height: H } = spec;
  const bg = scene.elements.find((el): el is Extract<SceneElement, { kind: 'bg' }> => el.kind === 'bg');
  const pulse = bg?.anim === 'pulse';

  if (!bg || bg.variant === 'gradient') {
    const c0 = bg?.colors?.[0] ?? T.bg[0];
    const c1 = bg?.colors?.[1] ?? T.bg[1];
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, c0);
    g.addColorStop(1, c1);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    if (T.name === 'aurora') drawAuroraBlobs(ctx, spec, T, absT, pulse);
    if (T.name === 'swiss') {
      // faint warm corner tint for depth
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

function drawBokeh(ctx: Ctx, spec: VideoSpec, t: number) {
  const { width: W, height: H } = spec;
  const orbs = 7;
  for (let i = 0; i < orbs; i++) {
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

function drawTitle(ctx: Ctx, spec: VideoSpec, T: ThemeTokens, el: { text: string; anim: string }, elT: number) {
  const { width: W, height: H } = spec;
  const yBase = H * 0.4;
  const size = titleSize(ctx, spec, T, el.text);

  if (el.anim === 'kinetic') {
    ctx.font = `800 ${size}px ${T.font}`;
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = T.letterSpacing;
    const words = el.text.split(/\s+/).filter(Boolean);
    const lines = wrapWords(ctx, words, W * 0.8);
    const lineHeight = size * 1.2;
    const spaceW = ctx.measureText(' ').width;
    const blockH = lines.length * lineHeight;
    let wi = 0;
    lines.forEach((line, li) => {
      const lineW = line.reduce((s, w) => s + w.w, 0) + spaceW * (line.length - 1);
      let x = (W - lineW) / 2;
      const y = yBase - blockH / 2 + lineHeight * (li + 0.5);
      for (const item of line) {
        const p = easeOutQuint(clamp01((elT - wi * 140) / 700));
        if (p > 0) {
          ctx.save();
          ctx.globalAlpha *= p;
          const dy = (1 - p) * 22;
          ctx.translate(x + item.w / 2, y + dy);
          ctx.scale(0.97 + 0.03 * p, 0.97 + 0.03 * p);
          ctx.fillStyle = T.text;
          ctx.textAlign = 'center';
          ctx.fillText(item.word, 0, 0);
          ctx.restore();
        }
        x += item.w + spaceW;
        wi++;
      }
    });
    ctx.letterSpacing = '0px';
    return;
  }

  if (el.anim === 'typewriter') {
    ctx.font = `800 ${size}px ${T.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = T.letterSpacing;
    const dur = Math.min(Math.max(900, el.text.length * 46), 4200);
    const p = clamp01(elT / dur);
    const shown = el.text.slice(0, Math.ceil(el.text.length * p));
    const fullW = ctx.measureText(el.text).width;
    ctx.save();
    ctx.globalAlpha *= 1;
    if (fullW > W * 0.8) {
      ctx.translate(W / 2, yBase);
      const s = (W * 0.8) / fullW;
      ctx.scale(s, s);
    } else {
      ctx.translate(W / 2, yBase);
    }
    ctx.fillStyle = T.text;
    ctx.fillText(shown, 0, 0);
    const caretA = p < 1 ? 0.85 : Math.sin(elT / 420) > 0 ? 0.8 : 0;
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

  // pop | fade | fade-up — whole block, ultra smooth
  const p = easeOutQuint(clamp01(elT / ELEM_DUR));
  if (p <= 0) return;
  ctx.font = `800 ${size}px ${T.font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = T.letterSpacing;
  ctx.fillStyle = T.text;
  const lines = wrapText(ctx, el.text, W * 0.8);
  const lineHeight = size * 1.2;
  const blockH = lines.length * lineHeight;
  ctx.save();
  ctx.globalAlpha *= p;
  ctx.translate(W / 2, yBase - blockH / 2 + lineHeight / 2 + (1 - p) * 18);
  if (el.anim === 'pop') ctx.scale(0.96 + 0.04 * p, 0.96 + 0.04 * p);
  lines.forEach((line, i) => ctx.fillText(line, 0, i * lineHeight));
  ctx.restore();
  ctx.letterSpacing = '0px';
  return;
}

function drawSubtitle(ctx: Ctx, spec: VideoSpec, T: ThemeTokens, el: { text: string; anim: string }, elT: number) {
  const { width: W, height: H } = spec;
  const y = H * 0.56;
  const size = H * 0.05;
  ctx.font = `500 ${size}px ${T.font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '1.5px';

  if (el.anim === 'typewriter') {
    const dur = Math.min(Math.max(800, el.text.length * 40), 3200);
    const p = clamp01(elT / dur);
    const shown = el.text.slice(0, Math.ceil(el.text.length * p));
    ctx.globalAlpha *= 0.95;
    ctx.fillStyle = T.dim;
    ctx.fillText(shown, W / 2, y);
    const cw = ctx.measureText(shown).width;
    ctx.fillStyle = T.palette[1] ?? T.text;
    ctx.globalAlpha *= Math.sin(elT / 380) > 0 ? 0.7 : 0;
    ctx.fillRect(W / 2 + cw / 2 + 8, y - size * 0.4, 2.5, size * 0.8);
    ctx.letterSpacing = '0px';
    return;
  }

  const p = easeOutQuint(clamp01(elT / ELEM_DUR));
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= p * 0.95;
  ctx.fillStyle = T.dim;
  const dy = el.anim === 'fade-up' ? (1 - p) * 14 : 0;
  ctx.fillText(el.text, W / 2, y + dy);
  ctx.restore();
  ctx.letterSpacing = '0px';
}

function drawBodyText(ctx: Ctx, spec: VideoSpec, T: ThemeTokens, el: { text: string; anim: string }, elT: number, hasSubtitle: boolean) {
  const { width: W, height: H } = spec;
  const size = H * 0.042;
  const y = (hasSubtitle ? 0.7 : 0.52) * H;
  const p = easeOutQuint(clamp01(elT / ELEM_DUR));
  if (p <= 0) return;
  ctx.font = `400 ${size}px ${T.font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = wrapText(ctx, el.text, W * 0.76);
  const lineHeight = size * 1.55;
  ctx.save();
  ctx.globalAlpha *= p * 0.92;
  ctx.fillStyle = T.dim;
  lines.forEach((line, i) => ctx.fillText(line, W / 2, y - ((lines.length - 1) * lineHeight) / 2 + i * lineHeight + (1 - p) * 12));
  ctx.restore();
}

/* ------------------------------ charts ------------------------------ */

function drawBars(ctx: Ctx, spec: VideoSpec, T: ThemeTokens, el: { data: { label: string; value: number }[] }, elT: number) {
  const { width: W, height: H } = spec;
  const data = el.data.slice(0, 8);
  if (data.length === 0) return;
  const maxV = Math.max(...data.map((d) => d.value), 0.0001);
  const hasTitle = true;
  const top = H * (hasTitle ? 0.52 : 0.42);
  const bottom = H * 0.85;
  const margin = W * 0.12;
  const areaW = W - margin * 2;
  const slotW = areaW / data.length;
  const barW = slotW * 0.5;

  // grid lines
  ctx.strokeStyle = T.gridLine;
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    const gy = bottom - ((bottom - top) / 3) * i;
    ctx.beginPath();
    ctx.moveTo(margin, gy);
    ctx.lineTo(W - margin, gy);
    ctx.stroke();
  }
  // baseline
  ctx.strokeStyle = T.name === 'swiss' ? 'rgba(17,17,17,0.35)' : 'rgba(22,22,29,0.25)';
  ctx.beginPath();
  ctx.moveTo(margin, bottom);
  ctx.lineTo(W - margin, bottom);
  ctx.stroke();

  data.forEach((d, i) => {
    const p = easeOutQuart(clamp01((elT - i * 140) / ELEM_DUR));
    if (p <= 0) return;
    const h = (d.value / maxV) * (bottom - top) * p;
    const x = margin + slotW * i + (slotW - barW) / 2;
    const y = bottom - h;
    const color = T.palette[i % T.palette.length];
    ctx.save();
    if (T.glow) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 22;
    } else {
      ctx.shadowColor = 'rgba(22, 22, 29, 0.20)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;
    }
    ctx.fillStyle = color;
    pathRoundRect(ctx, x, y, barW, h, Math.min(12, barW / 2.4));
    ctx.fill();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha *= p;
    ctx.fillStyle = T.text;
    ctx.font = `700 ${H * 0.032}px ${T.font}`;
    ctx.fillText(String(d.value), x + barW / 2, y - H * 0.03);
    ctx.fillStyle = T.dim;
    ctx.font = `600 ${H * 0.03}px ${T.font}`;
    ctx.fillText(d.label, x + barW / 2, bottom + H * 0.045);
    ctx.globalAlpha = 1;
  });
}

function drawPie(ctx: Ctx, spec: VideoSpec, T: ThemeTokens, el: { data: { label: string; value: number }[] }, elT: number) {
  const { width: W, height: H } = spec;
  const data = el.data.slice(0, 6);
  if (data.length === 0) return;
  const total = data.reduce((s, d) => s + Math.max(0, d.value), 0) || 1;
  const hasLegend = true;
  const cx = hasLegend ? W * 0.36 : W * 0.5;
  const cy = H * 0.55;
  const r = Math.min(H * 0.21, W * 0.18);
  const p = easeInOutQuint(clamp01(elT / 1100));

  let start = -Math.PI / 2;
  data.forEach((d, i) => {
    const frac = Math.max(0, d.value) / total;
    const sweep = frac * Math.PI * 2 * p;
    if (sweep <= 0) return;
    const color = T.palette[i % T.palette.length];
    ctx.save();
    if (T.glow) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
    } else {
      ctx.shadowColor = 'rgba(22,22,29,0.18)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 5;
    }
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.94;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + sweep);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    start += sweep;
  });

  // elegant center hole
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.58, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // legend
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  data.forEach((d, i) => {
    const lp = easeOutQuint(clamp01((elT - 300 - i * 120) / 600));
    if (lp <= 0) return;
    const color = T.palette[i % T.palette.length];
    const y = H * 0.42 + i * H * 0.085;
    ctx.save();
    ctx.globalAlpha *= lp;
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

/* --------------------------- image & shape --------------------------- */

function drawImage(ctx: Ctx, spec: VideoSpec, T: ThemeTokens, el: { src: string; anim: string }, elT: number, sceneDur: number) {
  const { width: W, height: H } = spec;
  const entry = getImage(el.src);
  const p = easeOutQuint(clamp01(elT / 900));
  if (p <= 0) return;
  const w = W * 0.58;
  const h = H * 0.5;
  const x = (W - w) / 2;
  const y = H * 0.52 - h / 2;
  const radius = H * 0.035;

  ctx.save();
  ctx.globalAlpha *= p;

  if (entry.ready && entry.img) {
    const kb = 1 + 0.06 * easeInOutQuint(clamp01(elT / Math.max(1, sceneDur))); // Ken Burns
    const img = entry.img;
    const scale = Math.max(w / img.width, h / img.height) * kb;
    const dw = img.width * scale;
    const dh = img.height * scale;
    if (T.glow) {
      ctx.shadowColor = 'rgba(22,22,29,0.35)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 12;
    } else {
      ctx.shadowColor = 'rgba(22,22,29,0.22)';
      ctx.shadowBlur = 26;
      ctx.shadowOffsetY = 10;
    }
    ctx.fillStyle = '#ffffff';
    pathRoundRect(ctx, x, y, w, h, radius);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.save();
    pathRoundRect(ctx, x + 5, y + 5, w - 10, h - 10, radius - 4);
    ctx.clip();
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.5;
    pathRoundRect(ctx, x, y, w, h, radius);
    ctx.stroke();
  } else {
    // graceful placeholder
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = T.dim;
    ctx.lineWidth = 2;
    pathRoundRect(ctx, x, y, w, h, radius);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = T.dim;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `500 ${H * 0.032}px ${T.font}`;
    ctx.fillText('image', W / 2, H * 0.52);
  }
  ctx.restore();
}

function drawShape(ctx: Ctx, spec: VideoSpec, T: ThemeTokens, el: { variant: string; anim: string }, elT: number, absT: number) {
  const { width: W, height: H } = spec;
  const p = easeOutQuint(clamp01(elT / 900));
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= p;

  if (el.variant === 'circle') {
    const breathe = el.anim === 'pulse' ? 1 + Math.sin(absT / 1800) * 0.04 : 1;
    const cx = W * 0.5 + Math.sin(absT / 2600) * W * 0.015;
    const cy = H * 0.42;
    const r = H * 0.3 * breathe;
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
    ctx.strokeStyle = T.name === 'swiss' ? 'rgba(17,17,17,0.3)' : 'rgba(124,108,240,0.4)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(W / 2, H * 0.44, H * 0.26, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // glass frame
    const inset = W * 0.05;
    ctx.strokeStyle = T.name === 'swiss' ? 'rgba(17,17,17,0.25)' : 'rgba(255,255,255,0.85)';
    ctx.fillStyle = T.name === 'swiss' ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0.30)';
    ctx.lineWidth = 2;
    pathRoundRect(ctx, inset, H * 0.08, W - inset * 2, H * 0.84, H * 0.04);
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
) {
  const content = scene.elements.filter((el) => el.kind !== 'bg');
  const kinds = new Set(content.map((el) => el.kind));
  let i = 0;
  for (const el of content) {
    const delay = ELEM_DELAY + i * ELEM_STAGGER;
    const elT = localT - delay;
    switch (el.kind) {
      case 'title':
        drawTitle(ctx, spec, T, el, elT);
        break;
      case 'subtitle':
        drawSubtitle(ctx, spec, T, el, elT);
        break;
      case 'text':
        drawBodyText(ctx, spec, T, el, elT, kinds.has('subtitle'));
        break;
      case 'bars':
        drawBars(ctx, spec, T, el, elT);
        break;
      case 'pie':
        drawPie(ctx, spec, T, el, elT);
        break;
      case 'image':
        drawImage(ctx, spec, T, el, elT, scene.durationMs);
        break;
      case 'shape':
        drawShape(ctx, spec, T, el, elT, absT);
        break;
      case 'bg':
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
) {
  const absT = scene.startMs + localT;
  const p = settled ? 1 : easeInOutQuint(clamp01(localT / TRANSITION_MS));
  const { width: W, height: H } = spec;

  ctx.save();
  ctx.globalAlpha = alphaMul;

  // scene enter motion — swift and smooth
  if (!settled && p < 1) {
    switch (scene.enter) {
      case 'fade':
        ctx.globalAlpha = alphaMul * p;
        break;
      case 'fade-up':
        ctx.globalAlpha = alphaMul * p;
        ctx.translate(0, (1 - p) * H * 0.05);
        break;
      case 'slide-left':
        ctx.globalAlpha = alphaMul * Math.min(1, p * 1.4);
        ctx.translate((1 - p) * W * 0.12, 0);
        break;
      case 'slide-right':
        ctx.globalAlpha = alphaMul * Math.min(1, p * 1.4);
        ctx.translate(-(1 - p) * W * 0.12, 0);
        break;
      case 'zoom-in':
        ctx.globalAlpha = alphaMul * p;
        ctx.translate(W / 2, H / 2);
        ctx.scale(0.965 + 0.035 * p, 0.965 + 0.035 * p);
        ctx.translate(-W / 2, -H / 2);
        break;
      default:
        break;
    }
  }

  drawBackground(ctx, spec, T, scene, absT);
  if (T.particles > 0) drawBokeh(ctx, spec, absT);
  drawSceneElements(ctx, spec, T, scene, localT, absT);
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

/** Render one frame at absolute time tMs. */
export function renderFrame(ctx: Ctx, spec: VideoSpec, tMs: number) {
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
    ctx.fillStyle = T.dim;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `500 ${H * 0.045}px ${T.font}`;
    ctx.fillText('Write your first scene in the editor', W / 2, H / 2);
    return;
  }

  const idx = activeSceneIndex(spec, t);
  const scene = spec.scenes[idx];
  const localT = t - scene.startMs;

  if (idx > 0 && localT < TRANSITION_MS) {
    const prev = spec.scenes[idx - 1];
    drawScene(ctx, spec, prev, prev.durationMs, 1 - easeInOutQuint(clamp01(localT / TRANSITION_MS)), true, T);
  }
  drawScene(ctx, spec, scene, localT, 1, false, T);
  drawOverlays(ctx, spec, T);
}

/** Time when every entrance animation in the scene has settled (for slideshow frames). */
export function sceneSettleMs(scene: Scene): number {
  const content = scene.elements.filter((el) => el.kind !== 'bg');
  let maxEnd = 900;
  content.forEach((el, i) => {
    const delay = ELEM_DELAY + i * ELEM_STAGGER;
    let end = delay + ELEM_DUR;
    if (el.kind === 'title' && el.anim === 'kinetic') {
      end = delay + el.text.split(/\s+/).length * 140 + 700;
    } else if ((el.kind === 'title' || el.kind === 'subtitle') && el.anim === 'typewriter') {
      end = delay + Math.min(Math.max(900, el.text.length * 46), 4200);
    } else if (el.kind === 'pie') {
      end = delay + 1100 + el.data.length * 120;
    }
    maxEnd = Math.max(maxEnd, end);
  });
  return Math.min(Math.max(maxEnd + 300, 900), Math.max(900, scene.durationMs - 60));
}
