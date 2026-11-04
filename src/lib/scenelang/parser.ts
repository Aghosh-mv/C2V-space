// SceneLang v2 parser — the "code converter".
// Every action is written out explicitly: no single word bundles many actions.
// Turns beginner-friendly SceneLang code into a VideoSpec timeline.

import type {
  BgVariant,
  ChartPoint,
  ElemAction,
  ParseError,
  ParseResult,
  Scene,
  SceneElement,
  SceneTransition,
  Transition,
  VideoSpec,
} from './types';

const DURATION = String.raw`(\d+(?:\.\d+)?)\s*(ms|s)?`;
const SIZE_RE = /^video\s+(\d+)\s*x\s*(\d+)(?:\s+(\d+)\s*fps)?/;
const THEME_RE = /^theme\s+([\w-]+)/;
const IMPORT_RE = /^import\s+([\w-]+)/;
const INIMPORT_RE = /^inimportcode\s*:\s*([\w-]+)/;
const SCENE_RE = /^(scene|outro)\s+(?:([\w-]+)\s+)?\(\s*([\d.]+)\s*s\s*\)\s*(.*)$/;
const TRANSITION_RE = new RegExp(`^transition\\s+(crossfade|cut|slide-left|slide-right|zoom)(?:\\s+${DURATION}\\s*)?$`);
const BG_RE = /^bg\s+(gradient|solid|grid|image)\b\s*(.*)$/;
const TEXT_RE = /^(title|subtitle|text)\s+"((?:[^"\\]|\\.)*)"\s*(.*)$/;
const CHART_RE = /^(bars|pie)\s+(?:\{([^}]*)\}|from\s+([\w.-]+))\s*(.*)$/;
const IMAGE_RE = /^(image|sprite)\s+(\S+)\s*(.*)$/;
const LINES_RE = /^lines\s+([\w.-]+)\s*(.*)$/;
const SHAPE_RE = /^shape\s+(circle|ring|rect)\s*(.*)$/;

// explicit action lines
const FADE_RE = new RegExp(`^fade\\s+(in|out)\\s+${DURATION}\\s*$`);
const MOVE_RE = new RegExp(`^(rise|drop|slide|drift)(?:\\s+(left|right|up|down))?\\s+(\\d+(?:\\.\\d+)?)\\s*(px)?\\s+over\\s+${DURATION}\\s*$`);
const ZOOM_RE = new RegExp(`^zoom\\s+from\\s+(\\d+(?:\\.\\d+)?)\\s+to\\s+(\\d+(?:\\.\\d+)?)\\s+over\\s+${DURATION}\\s*$`);
const SPIN_RE = new RegExp(`^spin\\s+(-?\\d+(?:\\.\\d+)?)\\s*(deg)?\\s+over\\s+${DURATION}\\s*$`);
const STAGGER_RE = new RegExp(`^stagger\\s+(words|letters|items)\\s+by\\s+${DURATION}\\s*$`);
const TYPE_RE = new RegExp(`^type\\s+on\\s+over\\s+${DURATION}\\s*$`);
const WAIT_RE = new RegExp(`^wait\\s+${DURATION}\\s*$`);
const PULSE_RE = new RegExp(`^pulse\\s+${DURATION}\\s*$`);
const GROW_RE = new RegExp(`^grow\\s+over\\s+${DURATION}\\s*$`);
const SWEEP_RE = new RegExp(`^sweep\\s+over\\s+${DURATION}\\s*$`);
const BOB_RE = new RegExp(`^bob\\s+(\\d+(?:\\.\\d+)?)\\s*(px)?\\s+over\\s+${DURATION}\\s*$`);

/** words that used to bundle several actions — kept only to teach the new way */
const LEGACY_WORDS = new Set([
  'kinetic', 'typewriter', 'pop', 'fade-up', 'fade', 'slide-left', 'slide-right',
  'zoom-in', 'pan', 'pulse', 'glow', 'grow', 'spin',
]);

const LEGACY_HINTS: Record<string, string> = {
  kinetic: 'fade in 0.5s + rise 22 over 0.5s + stagger words by 90ms',
  typewriter: 'type on over 1.4s',
  pop: 'fade in 0.5s + zoom from 96 to 100 over 0.5s',
  'fade-up': 'fade in 0.5s + rise 16 over 0.5s',
  'slide-left': 'slide left 40 over 0.6s',
  'slide-right': 'slide right 40 over 0.6s',
  'zoom-in': 'zoom from 97 to 100 over 0.7s',
  grow: 'grow over 0.8s',
  spin: 'spin 360 over 1.2s',
};

const BG_COLORS = ['#fafafc', '#edeaf7'];
const MAX_SCENE_MS = 3_600_000; // one hour per scene
const MAX_TOTAL_MS = 86_400_000; // a whole day — your code decides the length

function toMs(n: number, unit: string | undefined, fallback: 's' | 'ms' = 's'): number {
  if (unit === 'ms') return n;
  if (unit === 's') return n * 1000;
  return fallback === 's' ? n * 1000 : n;
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
    errors.push({ line, message: 'gradient needs colors like: bg gradient #fafafc -> #edeaf7' });
    return BG_COLORS;
  }
  if (colors.length === 1) return [colors[0], colors[0]];
  return colors;
}

/** Check trailing words on an element line for legacy combo words and teach the fix. */
function flagLegacy(trailing: string, line: number, errors: ParseError[]) {
  for (const word of trailing.split(/\s+/).filter(Boolean)) {
    if (LEGACY_WORDS.has(word)) {
      const hint = LEGACY_HINTS[word] ?? 'write each action on its own line';
      errors.push({
        line,
        message: `"${word}" used to bundle several actions — v2 writes each one out, e.g. ${hint}`,
      });
    } else if (word !== 'pulse' && !word.startsWith('//')) {
      errors.push({ line, message: `unexpected "${word}" after the element — actions go on their own indented lines` });
    }
  }
}

function legacySceneEnter(trailing: string): string | null {
  for (const word of trailing.split(/\s+/).filter(Boolean)) {
    if (LEGACY_WORDS.has(word)) return word;
  }
  return null;
}

/**
 * Parse SceneLang v2 source into a VideoSpec.
 * Never throws — returns errors with line numbers instead.
 * `knownStyles` = style names installed from the Marketplace.
 * `knownAssets` = file names the user imported (images, text, csv).
 */
export function parseSceneLang(
  source: string,
  knownStyles: string[] = [],
  knownAssets: string[] = [],
): ParseResult {
  const errors: ParseError[] = [];
  const lines = source.split('\n');
  const assetSet = new Set(knownAssets.map((a) => a.toLowerCase()));

  let width = 1280;
  let height = 720;
  let fps = 30;
  let theme = 'aurora';
  let sawTheme = false;
  const imports = new Set<string>();
  const scenes: Scene[] = [];
  let current: Scene | null = null;
  let currentElement: SceneElement | null = null;
  let waitSoFar = 0;

  const addAction = (action: ElemAction, line: number) => {
    if (!currentElement) {
      errors.push({
        line,
        message: 'actions must sit under an element — write something like  title "Hi"  first',
      });
      return;
    }
    if (!('actions' in currentElement)) return;
    (currentElement.actions as ElemAction[]).push(action);
  };

  const pushElement = (el: SceneElement) => {
    if (!current) return;
    current.elements.push(el);
    currentElement = el;
    waitSoFar = 0;
  };

  lines.forEach((rawLine, i) => {
    const line = i + 1;
    const text = rawLine.trim();
    if (!text || text.startsWith('//')) return;
    const indent = rawLine.length - rawLine.trimStart().length;

    // ---- setup lines -----------------------------------------------------
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
      sawTheme = true;
      return;
    }

    const importMatch = text.match(IMPORT_RE);
    if (importMatch) {
      imports.add(importMatch[1].toLowerCase());
      return;
    }

    // pull a previous session into the editor — resolved by the app, not here
    const inimportMatch = text.match(INIMPORT_RE);
    if (inimportMatch) return;
    if (/^inimportcode\b/.test(text)) {
      errors.push({ line, message: 'write it as:  inimportcode :session-id  — copy an id from the History tab' });
      return;
    }

    // ---- action lines (indented under an element) ------------------------
    if (indent >= 2 && currentElement) {
      let m: RegExpMatchArray | null;
      if ((m = text.match(FADE_RE))) {
        addAction({ kind: m[1] === 'in' ? 'fade-in' : 'fade-out', startMs: waitSoFar, durMs: toMs(parseFloat(m[2]), m[3]) }, line);
        return;
      }
      if ((m = text.match(MOVE_RE))) {
        const verb = m[1];
        let dir: ElemAction['dir'] = m[2] as ElemAction['dir'];
        if (!dir) dir = verb === 'rise' ? 'up' : verb === 'drop' ? 'down' : 'left';
        addAction(
          { kind: 'move', startMs: waitSoFar, durMs: toMs(parseFloat(m[5]), m[6]), amount: parseFloat(m[3]), dir, loop: verb === 'drift' },
          line,
        );
        return;
      }
      if ((m = text.match(ZOOM_RE))) {
        addAction({ kind: 'zoom', startMs: waitSoFar, durMs: toMs(parseFloat(m[3]), m[4]), from: parseFloat(m[1]), to: parseFloat(m[2]) }, line);
        return;
      }
      if ((m = text.match(SPIN_RE))) {
        addAction({ kind: 'spin', startMs: waitSoFar, durMs: toMs(parseFloat(m[3]), m[4]), amount: parseFloat(m[1]) }, line);
        return;
      }
      if ((m = text.match(STAGGER_RE))) {
        addAction({ kind: 'stagger', startMs: 0, durMs: 0, unit: m[1] as ElemAction['unit'], amount: toMs(parseFloat(m[2]), m[3], 'ms') }, line);
        return;
      }
      if ((m = text.match(TYPE_RE))) {
        addAction({ kind: 'type', startMs: waitSoFar, durMs: toMs(parseFloat(m[1]), m[2]) }, line);
        return;
      }
      if ((m = text.match(WAIT_RE))) {
        waitSoFar += toMs(parseFloat(m[1]), m[2], 'ms');
        return;
      }
      if ((m = text.match(PULSE_RE))) {
        addAction({ kind: 'pulse', startMs: waitSoFar, durMs: toMs(parseFloat(m[1]), m[2]), loop: true }, line);
        return;
      }
      if ((m = text.match(GROW_RE))) {
        addAction({ kind: 'grow', startMs: waitSoFar, durMs: toMs(parseFloat(m[1]), m[2]) }, line);
        return;
      }
      if ((m = text.match(SWEEP_RE))) {
        addAction({ kind: 'sweep', startMs: waitSoFar, durMs: toMs(parseFloat(m[1]), m[2]) }, line);
        return;
      }
      if ((m = text.match(BOB_RE))) {
        addAction({ kind: 'bob', startMs: waitSoFar, durMs: toMs(parseFloat(m[3]), m[4]), amount: parseFloat(m[1]), loop: true }, line);
        return;
      }
    }

    // ---- scene -----------------------------------------------------------
    const sceneMatch = text.match(SCENE_RE);
    if (sceneMatch) {
      const name = sceneMatch[2] ?? `scene-${scenes.length + 1}`;
      const durationMs = Math.round(parseFloat(sceneMatch[3]) * 1000);
      const legacy = legacySceneEnter(sceneMatch[4]);
      if (legacy) {
        errors.push({
          line,
          message: `scene lines no longer take "${legacy}" — scene changes are explicit now: add "transition crossfade 0.85s" inside the scene`,
        });
      } else if (sceneMatch[4].trim()) {
        errors.push({ line, message: `unexpected "${sceneMatch[4].trim()}" after the duration — only scene name (Xs) goes here` });
      }
      if (durationMs < 500) {
        errors.push({ line, message: `scene "${name}" needs at least (0.5s)` });
      }
      current = {
        name,
        durationMs: Math.min(MAX_SCENE_MS, Math.max(500, durationMs)),
        transition: { kind: 'crossfade', ms: 850 },
        elements: [],
        startMs: 0,
        endMs: 0,
        index: scenes.length,
      };
      scenes.push(current);
      currentElement = null;
      waitSoFar = 0;
      return;
    }

    // ---- everything below belongs inside a scene --------------------------
    if (!current) {
      errors.push({
        line,
        message: `"${text.split(/\s+/)[0]}" must be inside a scene — start one with: scene my-scene (3s)`,
      });
      return;
    }

    const transMatch = text.match(TRANSITION_RE);
    if (transMatch) {
      const ms = transMatch[2] ? toMs(parseFloat(transMatch[2]), transMatch[3]) : 850;
      current.transition = { kind: transMatch[1] as SceneTransition, ms: Math.max(0, Math.min(2000, ms)) };
      return;
    }

    const bgMatch = text.match(BG_RE);
    if (bgMatch) {
      const variant = bgMatch[1] as BgVariant;
      const rest = bgMatch[2].trim();
      const el: Extract<SceneElement, { kind: 'bg' }> = {
        kind: 'bg',
        variant,
        colors:
          variant === 'gradient'
            ? parseColors(rest, errors, line)
            : variant === 'solid'
              ? [rest || '#fafafc']
              : [],
        actions: [],
      };
      if (variant === 'image') {
        const name = rest.split(/\s+/)[0] ?? '';
        if (!name) errors.push({ line, message: 'bg image needs a file: bg image terrain.jpg (import it with the Import button)' });
        else if (!assetSet.has(name.toLowerCase()) && !/^(https?:\/\/|\/|data:)/.test(name)) {
          errors.push({ line, message: `"${name}" isn't imported yet — use the Import button above the editor first` });
        }
        el.src = name;
        flagLegacy(rest.slice(name.length), line, errors);
      } else {
        // strip the color spec before looking for stray words
        let trailing = rest;
        if (variant === 'gradient') trailing = rest.replace(/#[0-9a-fA-F]{3,8}/g, ' ').replace(/->/g, ' ');
        else if (variant === 'solid') trailing = rest.replace(/^#[0-9a-fA-F]{3,8}/, ' ');
        flagLegacy(trailing, line, errors);
      }
      pushElement(el);
      return;
    }

    const textMatch = text.match(TEXT_RE);
    if (textMatch) {
      pushElement({ kind: textMatch[1] as 'title' | 'subtitle' | 'text', text: textMatch[2].replace(/\\"/g, '"'), actions: [] });
      flagLegacy(textMatch[3], line, errors);
      return;
    }

    const chartMatch = text.match(CHART_RE);
    if (chartMatch) {
      const kind = chartMatch[1] as 'bars' | 'pie';
      let data: ChartPoint[] = [];
      let from: string | undefined;
      if (chartMatch[2] !== undefined) {
        data = parseChartPairs(chartMatch[2]);
        if (data.length === 0) {
          errors.push({ line, message: `${kind} needs data like: ${kind} {Jan:12, Feb:30}` });
        }
      } else {
        from = chartMatch[3];
        if (!assetSet.has(from.toLowerCase())) {
          errors.push({ line, message: `"${from}" isn't imported yet — import a .csv file with the Import button, then ${kind} from ${from}` });
        }
      }
      pushElement({ kind, data, from, actions: [] });
      flagLegacy(chartMatch[4], line, errors);
      return;
    }

    const imageMatch = text.match(IMAGE_RE);
    if (imageMatch) {
      const src = imageMatch[2];
      if (!/^(https?:\/\/|\/|data:)/.test(src) && !assetSet.has(src.toLowerCase())) {
        errors.push({
          line,
          message: `"${src}" isn't imported yet — use the Import button above the editor to bring in your file (or paste an image URL)`,
        });
      }
      pushElement({ kind: imageMatch[1] as 'image' | 'sprite', src, actions: [] });
      flagLegacy(imageMatch[3], line, errors);
      return;
    }

    const linesMatch = text.match(LINES_RE);
    if (linesMatch) {
      const name = linesMatch[1];
      if (!assetSet.has(name.toLowerCase())) {
        errors.push({ line, message: `"${name}" isn't imported yet — import a .txt dialogue file with the Import button, then lines ${name}` });
      }
      pushElement({ kind: 'lines', name, items: [], actions: [] });
      flagLegacy(linesMatch[2], line, errors);
      return;
    }

    const shapeMatch = text.match(SHAPE_RE);
    if (shapeMatch) {
      pushElement({ kind: 'shape', variant: shapeMatch[1] as 'circle' | 'ring' | 'rect', actions: [] });
      flagLegacy(shapeMatch[2], line, errors);
      return;
    }

    errors.push({ line, message: `I don't understand "${text}" — every action gets its own line; see the Learner for the full library` });
  });

  if (scenes.length > 0 && !sawTheme) {
    errors.push({
      line: 0,
      message: 'declare the look — add a theme line near the top:  theme aurora  (or any style name from the Marketplace)',
    });
  }

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
      message: `total video is ${(totalMs / 1000).toFixed(0)}s — keep it under 24 hours`,
    });
  }

  // theme must be built-in, imported, or installed from the marketplace
  const known = new Set(['aurora', 'swiss', ...imports, ...knownStyles.map((s) => s.toLowerCase())]);
  if (!known.has(theme)) {
    errors.push({
      line: 0,
      message: `style "${theme}" isn't installed — open the Marketplace to get it, or add "import ${theme}" above the theme line`,
    });
  }

  const spec: VideoSpec = { width, height, fps, theme, scenes, totalMs };
  return { spec, errors };
}

/** Human-readable duration: 4.0s · 3m 25s · 1h 05m */
export function formatDuration(ms: number): string {
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  if (s < 3600) {
    return `${Math.floor(s / 60)}m ${String(Math.round(s % 60)).padStart(2, '0')}s`;
  }
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return `${h}h ${String(m).padStart(2, '0')}m`;
}
