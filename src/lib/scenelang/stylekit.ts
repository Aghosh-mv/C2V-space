// StyleKit — the second SceneLang language.
// A style declares its own look from scratch: there is NO default base to
// inherit — you say what you want, line by line. Write it, publish it to the
// Marketplace, and anyone can `import <name>` and use it as their theme.
//
//   style midnight-lux
//   bg #0e0e16 -> #1a1a2e
//   ink #f5f3ff
//   dim rgba(245, 243, 255, 0.66)
//   accents #c4b5fd, #7dd3c8, #f7c59f
//   font sans
//   tracking 1.5
//   vignette 0.25
//   orbs 9

import type { ParseError } from './types';
import { registerStyle, type ThemeTokens } from './themes';

const HEX = /^#[0-9a-fA-F]{3,8}$/;
const CSS_COLOR = /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|[a-z]+)$/i;

export interface StyleParseResult {
  name: string | null;
  tokens: ThemeTokens | null;
  errors: ParseError[];
}

const FONT_STACKS: Record<string, string> = {
  sans: '"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
};

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split('').map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    const [r, g, b] = hexToRgb(color);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

export function parseStyleKit(source: string): StyleParseResult {
  const errors: ParseError[] = [];
  const lines = source.split('\n');
  let name: string | null = null;

  const acc: Partial<ThemeTokens> = {};
  let sawBg = false;
  let sawInk = false;

  lines.forEach((rawLine, i) => {
    const line = i + 1;
    const text = rawLine.trim();
    if (!text || text.startsWith('//')) return;

    const styleMatch = text.match(/^style\s+([\w-]+)$/);
    if (styleMatch) {
      name = styleMatch[1];
      return;
    }

    // `base` is gone — a style stands on its own
    if (/^base\s+/.test(text)) {
      errors.push({
        line,
        message: 'styles have no default base anymore — declare what you need: bg, ink, accents, font…',
      });
      return;
    }

    if (!name) {
      errors.push({ line, message: 'start your style with:  style my-style-name' });
      return;
    }

    const spaceIdx = text.indexOf(' ');
    const key = (spaceIdx === -1 ? text : text.slice(0, spaceIdx)).toLowerCase();
    const value = spaceIdx === -1 ? '' : text.slice(spaceIdx + 1).trim();

    switch (key) {
      case 'bg': {
        const parts = value.split('->').map((s) => s.trim());
        if (parts.length >= 2 && parts.every((c) => CSS_COLOR.test(c))) {
          acc.bg = [parts[0], parts[1]];
          sawBg = true;
        } else if (parts.length === 1 && CSS_COLOR.test(parts[0])) {
          acc.bg = [parts[0], parts[0]];
          sawBg = true;
        } else {
          errors.push({ line, message: 'bg needs two colors:  bg #fafafc -> #edeaf7' });
        }
        break;
      }
      case 'ink':
        if (CSS_COLOR.test(value)) {
          acc.text = value;
          sawInk = true;
        } else errors.push({ line, message: 'ink needs a color, e.g.  ink #16161d' });
        break;
      case 'dim':
        if (CSS_COLOR.test(value)) acc.dim = value;
        else errors.push({ line, message: 'dim needs a color (or rgba), e.g.  dim rgba(0,0,0,0.6)' });
        break;
      case 'accents': {
        const colors = value.split(',').map((s) => s.trim()).filter((c) => CSS_COLOR.test(c));
        if (colors.length >= 1) acc.palette = colors;
        else errors.push({ line, message: 'accents needs colors separated by commas' });
        break;
      }
      case 'font':
        if (FONT_STACKS[value.toLowerCase()]) acc.font = FONT_STACKS[value.toLowerCase()];
        else errors.push({ line, message: 'font is sans, serif or mono' });
        break;
      case 'tracking': {
        const n = parseFloat(value);
        if (!Number.isNaN(n)) acc.letterSpacing = `${n}px`;
        break;
      }
      case 'glow':
        acc.glow = value.toLowerCase() === 'on';
        break;
      case 'vignette': {
        const n = parseFloat(value);
        if (!Number.isNaN(n)) acc.vignette = n > 0 ? `rgba(15, 14, 24, ${Math.min(0.5, n)})` : 'none';
        break;
      }
      case 'orbs': {
        const n = parseInt(value, 10);
        if (!Number.isNaN(n)) acc.particles = Math.min(24, Math.max(0, n));
        break;
      }
      case 'motion':
      case 'texture':
        // accepted for forward-compatibility; rendering keeps the smooth premium feel
        break;
      default:
        errors.push({ line, message: `unknown StyleKit word "${key}" — try bg, ink, dim, accents, font, tracking, glow, vignette, orbs` });
    }
  });

  if (!name) {
    return { name: null, tokens: null, errors };
  }

  // no base — a style must declare its own bg and ink
  if (!sawBg) {
    errors.push({ line: 0, message: 'styles have no base — declare the background:  bg #fafafc -> #edeaf7' });
  }
  if (!sawInk) {
    errors.push({ line: 0, message: 'styles have no base — declare the text color:  ink #16161d' });
  }

  const ink = acc.text ?? '#16161d';
  const tokens: ThemeTokens = {
    name,
    label: name,
    titleBar: false,
    scanlines: false,
    bg: acc.bg ?? ['#fafafa', '#efefef'],
    text: ink,
    dim: acc.dim ?? withAlpha(ink, 0.62),
    palette: acc.palette ?? [ink],
    font: acc.font ?? FONT_STACKS.sans,
    letterSpacing: acc.letterSpacing ?? '0px',
    glow: acc.glow ?? false,
    particles: acc.particles ?? 0,
    vignette: acc.vignette ?? 'none',
    gridLine: withAlpha(ink, 0.08),
  };

  // make it available to the renderer right away
  registerStyle(tokens);
  return { name, tokens, errors };
}
