// SceneLang parser — the "code converter".
// Turns beginner-friendly SceneLang code into a VideoSpec timeline.

import type {
  BgVariant,
  ChartAnim,
  ChartPoint,
  EnterAnim,
  ParseError,
  ParseResult,
  Scene,
  SceneElement,
  TextAnim,
  VideoSpec,
} from './types';

const DURATION_RE = /\(\s*([\d.]+)\s*s\s*\)/;
const SIZE_RE = /^video\s+(\d+)\s*x\s*(\d+)(?:\s+(\d+)\s*fps)?/;
const THEME_RE = /^theme\s+([\w-]+)/;
const SCENE_RE = /^(scene|outro)\s+(?:([\w-]+)\s+)?\(\s*([\d.]+)\s*s\s*\)\s*(.*)$/;
const BG_RE = /^bg\s+(gradient|solid|grid)\b\s*(.*)$/;
const TEXT_RE = /^(title|subtitle|text)\s+"((?:[^"\\]|\\.)*)"\s*(.*)$/;
const CHART_RE = /^(bars|pie)\s+\{([^}]*)\}\s*(.*)$/;
const IMAGE_RE = /^image\s+(\S+)\s*(.*)$/;
const SHAPE_RE = /^shape\s+(circle|ring|rect)\s*(.*)$/;

const ENTER_ANIMS = new Set<EnterAnim>([
  'fade',
  'fade-up',
  'slide-left',
  'slide-right',
  'zoom-in',
  'none',
]);

const TEXT_ANIMS = new Set<TextAnim>(['kinetic', 'typewriter', 'pop', 'fade', 'fade-up']);
const CHART_ANIMS = new Set<ChartAnim>(['grow', 'spin', 'pop', 'fade']);

const BG_COLORS = ['#0f0c29', '#302b63'];
const MAX_SCENE_MS = 30_000;
const MAX_TOTAL_MS = 120_000;

function normalizeAnim(raw: string): string {
  return raw.trim().replace(/^enter:/, '').toLowerCase();
}

function parseChartPairs(raw: string): ChartPoint[] {
  const out: ChartPoint[] = [];
  for (const part of raw.split(',')) {
    const chunk = part.trim();
    if (!chunk) continue;
    const idx = chunk.indexOf(':');
    if (idx === -1) continue;
    const label = chunk.slice(0, idx).trim();
    const value = parseFloat(chunk.slice(idx + 1).trim());
    if (!label || Number.isNaN(value)) continue;
    out.push({ label, value });
  }
  return out;
}

function parseColors(raw: string, errors: ParseError[], line: number): string[] {
  const colors: string[] = [];
  for (const token of raw.split('->')) {
    const c = token.trim();
    if (/^#[0-9a-fA-F]{3,8}$/.test(c)) colors.push(c);
  }
  if (colors.length === 0) {
    errors.push({ line, message: 'gradient needs colors like: bg gradient #0f0c29 -> #302b63' });
    return BG_COLORS;
  }
  if (colors.length === 1) return [colors[0], colors[0]];
  return colors;
}

function pickAnim(
  rest: string,
  allowed: Set<string>,
  fallback: string,
): string {
  const tokens = rest.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    const a = normalizeAnim(token);
    if (allowed.has(a)) return a;
  }
  return fallback;
}

/**
 * Parse SceneLang source code into a VideoSpec.
 * Never throws — returns errors with line numbers instead.
 */
export function parseSceneLang(source: string): ParseResult {
  const errors: ParseError[] = [];
  const lines = source.split('\n');

  let width = 1280;
  let height = 720;
  let fps = 30;
  let theme = 'neon';
  const scenes: Scene[] = [];
  let current: Scene | null = null;

  lines.forEach((rawLine, i) => {
    const line = i + 1;
    const text = rawLine.trim();
    if (!text || text.startsWith('//')) return;

    // video setup
    const sizeMatch = text.match(SIZE_RE);
    if (sizeMatch) {
      width = Math.min(3840, Math.max(320, parseInt(sizeMatch[1], 10)));
      height = Math.min(2160, Math.max(240, parseInt(sizeMatch[2], 10)));
      if (sizeMatch[3]) fps = Math.min(60, Math.max(10, parseInt(sizeMatch[3], 10)));
      return;
    }

    const themeMatch = text.match(THEME_RE);
    if (themeMatch) {
      theme = themeMatch[1].toLowerCase();
      return;
    }

    // scene / outro
    const sceneMatch = text.match(SCENE_RE);
    if (sceneMatch) {
      const name = sceneMatch[2] ?? `scene-${scenes.length + 1}`;
      const durationMs = Math.round(parseFloat(sceneMatch[3]) * 1000);
      const enter = pickAnim(sceneMatch[4], ENTER_ANIMS, 'fade-up');
      if (durationMs < 500) {
        errors.push({ line, message: `scene "${name}" needs at least (0.5s)` });
      }
      current = {
        name,
        durationMs: Math.min(MAX_SCENE_MS, Math.max(500, durationMs)),
        enter: enter as EnterAnim,
        elements: [],
        startMs: 0,
        endMs: 0,
        index: scenes.length,
      };
      scenes.push(current);
      return;
    }

    // everything below belongs inside a scene
    if (!current) {
      errors.push({
        line,
        message: `"${text.split(/\s+/)[0]}" must be inside a scene — start one with: scene my-scene (3s) fade-up`,
      });
      return;
    }

    const bgMatch = text.match(BG_RE);
    if (bgMatch) {
      const variant = bgMatch[1] as BgVariant;
      const colors =
        variant === 'gradient'
          ? parseColors(bgMatch[2], errors, line)
          : variant === 'solid'
            ? [bgMatch[2].trim() || '#0f0c29']
            : [];
      const anim = pickAnim(bgMatch[2], new Set(['pulse']), 'none');
      current.elements.push({
        kind: 'bg',
        variant,
        colors: variant === 'grid' ? [] : colors,
        anim: anim === 'pulse' ? 'pulse' : 'none',
      });
      return;
    }

    const textMatch = text.match(TEXT_RE);
    if (textMatch) {
      const kind = textMatch[1] as 'title' | 'subtitle' | 'text';
      const value = textMatch[2].replace(/\\"/g, '"');
      const fallback = kind === 'title' ? 'kinetic' : kind === 'subtitle' ? 'typewriter' : 'fade';
      const anim = pickAnim(textMatch[3], TEXT_ANIMS, fallback);
      current.elements.push({
        kind,
        text: value,
        anim: anim as TextAnim,
      });
      return;
    }

    const chartMatch = text.match(CHART_RE);
    if (chartMatch) {
      const kind = chartMatch[1] as 'bars' | 'pie';
      const data = parseChartPairs(chartMatch[2]);
      if (data.length === 0) {
        errors.push({
          line,
          message: `${kind} needs data like: ${kind} {Jan:12, Feb:30}`,
        });
      }
      const fallback: ChartAnim = kind === 'bars' ? 'grow' : 'spin';
      const anim = pickAnim(chartMatch[3], CHART_ANIMS, fallback);
      current.elements.push({ kind, data, anim: anim as ChartAnim });
      return;
    }

    const imageMatch = text.match(IMAGE_RE);
    if (imageMatch) {
      const src = imageMatch[1];
      const anim = pickAnim(imageMatch[2], new Set(['zoom-in', 'pan', 'fade']), 'zoom-in');
      current.elements.push({
        kind: 'image',
        src,
        anim: anim as 'zoom-in' | 'pan' | 'fade',
      });
      return;
    }

    const shapeMatch = text.match(SHAPE_RE);
    if (shapeMatch) {
      const anim = pickAnim(shapeMatch[2], new Set(['pulse', 'glow', 'fade']), 'pulse');
      current.elements.push({
        kind: 'shape',
        variant: shapeMatch[1] as 'circle' | 'ring' | 'rect',
        anim: anim as 'pulse' | 'glow' | 'fade',
      });
      return;
    }

    errors.push({ line, message: `I don't understand "${text}" — check the cheat sheet below the editor` });
  });

  if (scenes.length === 0) {
    return {
      spec: { width, height, fps, theme, scenes: [], totalMs: 0 },
      errors,
    };
  }

  // compute timeline
  let cursor = 0;
  for (const scene of scenes) {
    scene.startMs = cursor;
    scene.endMs = cursor + scene.durationMs;
    cursor = scene.endMs;
  }
  const totalMs = cursor;
  if (totalMs > MAX_TOTAL_MS) {
    errors.push({
      line: lines.length,
      message: `total video is ${(totalMs / 1000).toFixed(0)}s — keep it under ${MAX_TOTAL_MS / 1000}s`,
    });
  }

  return {
    spec: { width, height, fps, theme, scenes, totalMs },
    errors,
  };
}

/** Human-readable duration like "12.5s" */
export function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}
