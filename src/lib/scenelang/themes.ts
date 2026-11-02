// Theme packs — the "image styles" of SceneLang.
// A theme is one keyword in code (`theme neon`) that swaps the entire look.

export interface ThemeTokens {
  name: string;
  label: string;
  /** default background gradient */
  bg: [string, string];
  /** main text color */
  text: string;
  /** secondary text color */
  dim: string;
  /** chart / accent palette */
  palette: string[];
  /** neon glow effects on/off */
  glow: boolean;
  /** scanline overlay on/off */
  scanlines: boolean;
  /** floating particle count */
  particles: number;
  /** grid lines color */
  gridLine: string;
  /** vignette color, or 'none' */
  vignette: string;
  /** canvas font stack */
  font: string;
  /** title letter-spacing */
  letterSpacing: string;
  /** accent underline bar under titles */
  titleBar: boolean;
}

const SANS = '"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif';

export const NEON: ThemeTokens = {
  name: 'neon',
  label: 'Neon — cyberpunk glow',
  bg: ['#0f0c29', '#302b63'],
  text: '#f4f6ff',
  dim: 'rgba(244, 246, 255, 0.72)',
  palette: ['#00f0ff', '#ff2fd6', '#b4ff39', '#ffb347'],
  glow: true,
  scanlines: true,
  particles: 42,
  gridLine: 'rgba(0, 240, 255, 0.10)',
  vignette: 'rgba(2, 2, 14, 0.55)',
  font: SANS,
  letterSpacing: '2px',
  titleBar: false,
};

export const SWISS: ThemeTokens = {
  name: 'swiss',
  label: 'Swiss — clean & minimal',
  bg: ['#ffffff', '#efefeb'],
  text: '#111111',
  dim: 'rgba(17, 17, 17, 0.62)',
  palette: ['#111111', '#e63946', '#8d8d86', '#c9c9c3'],
  glow: false,
  scanlines: false,
  particles: 0,
  gridLine: 'rgba(17, 17, 17, 0.07)',
  vignette: 'none',
  font: SANS,
  letterSpacing: '0px',
  titleBar: true,
};

const THEMES: Record<string, ThemeTokens> = {
  neon: NEON,
  swiss: SWISS,
};

export function getTheme(name: string): ThemeTokens {
  return THEMES[name.toLowerCase()] ?? NEON;
}

export function themeList(): ThemeTokens[] {
  return [NEON, SWISS];
}

/** Rewrite (or insert) the `theme` line in SceneLang code. */
export function setThemeInCode(code: string, themeName: string): string {
  const lines = code.split('\n');
  let replaced = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*theme\s+\S+/.test(lines[i])) {
      lines[i] = `theme ${themeName}`;
      replaced = true;
      break;
    }
  }
  if (!replaced) {
    const videoIdx = lines.findIndex((l) => /^\s*video\b/.test(l));
    if (videoIdx >= 0) lines.splice(videoIdx + 1, 0, `theme ${themeName}`);
    else lines.unshift(`theme ${themeName}`);
  }
  return lines.join('\n');
}
