// Theme packs + a live registry of user-defined StyleKit styles.

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
  /** neon glow effects on/off — off everywhere, we stay smooth */
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

export const AURORA: ThemeTokens = {
  name: 'aurora',
  label: 'Aurora — smooth & premium',
  bg: ['#fafafc', '#edeaf7'],
  text: '#16161d',
  dim: 'rgba(22, 22, 29, 0.62)',
  palette: ['#16161d', '#7c6cf0', '#2bb59a', '#f2925c'],
  glow: false,
  scanlines: false,
  particles: 7,
  gridLine: 'rgba(22, 22, 29, 0.08)',
  vignette: 'rgba(15, 14, 24, 0.08)',
  font: SANS,
  letterSpacing: '1px',
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

/** The bare, unstyled look — what renders when no theme was declared at all.
 *  Not a style you can pick: it is the absence of one. */
export const PLAIN: ThemeTokens = {
  name: 'plain',
  label: 'Plain — unstyled',
  bg: ['#ffffff', '#f4f4f5'],
  text: '#18181b',
  dim: 'rgba(24, 24, 27, 0.55)',
  palette: ['#18181b', '#52525b', '#a1a1aa', '#d4d4d8'],
  glow: false,
  scanlines: false,
  particles: 0,
  gridLine: 'rgba(24, 24, 27, 0.07)',
  vignette: 'none',
  font: SANS,
  letterSpacing: '0px',
  titleBar: false,
};

/** Builtin looks that SceneLang's `theme` line accepts out of the box —
 *  applied only when explicitly written, never as a default. */
const BUILTINS: Record<string, ThemeTokens> = {
  aurora: AURORA,
  swiss: SWISS,
};

/** Styles registered from StyleKit code (marketplace imports, user styles). */
const CUSTOM: Record<string, ThemeTokens> = {};

export function registerStyle(tokens: ThemeTokens) {
  CUSTOM[tokens.name.toLowerCase()] = tokens;
}

export function unregisterStyle(name: string) {
  delete CUSTOM[name.toLowerCase()];
}

export function knownStyleNames(): string[] {
  return [...Object.keys(BUILTINS), ...Object.keys(CUSTOM)];
}

export function getTheme(name: string): ThemeTokens {
  const key = name.toLowerCase();
  return CUSTOM[key] ?? BUILTINS[key] ?? PLAIN;
}

export function isKnownStyle(name: string): boolean {
  const key = name.toLowerCase();
  return key in BUILTINS || key in CUSTOM;
}

export function themeList(): ThemeTokens[] {
  return [AURORA, SWISS, ...Object.values(CUSTOM)];
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

/** Ensure an `import <name>` line exists in SceneLang code. */
export function addImportToCode(code: string, styleName: string): string {
  const lines = code.split('\n');
  const already = lines.some((l) => /^\s*import\s+[\w-]+/.test(l) && l.trim().endsWith(styleName));
  if (already) return code;
  const themeIdx = lines.findIndex((l) => /^\s*theme\s/.test(l));
  const insertAt = themeIdx >= 0 ? themeIdx : 0;
  lines.splice(insertAt, 0, `import ${styleName}`);
  return lines.join('\n');
}
