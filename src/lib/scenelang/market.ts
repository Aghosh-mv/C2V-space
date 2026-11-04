// Marketplace — styles, video templates, effects and videos that creators can
// publish, price (or give away), buy (simulated) and import into the Studio.
// The premade catalog (60+ styles, 240+ templates, 24 effect packs) is
// browsable here and is 100% free — this is a global, premium, free product.

import { CATALOG_STYLES, CATALOG_TEMPLATES } from './catalog';
import { CATALOG_EFFECTS } from './effects';

export interface MarketItem {
  id: string;
  kind: 'style' | 'template' | 'video' | 'effect';
  title: string;
  author: string;
  price: number; // 0 = free (the whole premade catalog is free)
  description: string;
  /** StyleKit code for styles, SceneLang code for templates, videos & effects */
  code: string;
  official?: boolean;
  createdAt: number;
}

const ITEMS_KEY = 'scenelang.market.items';
const OWNED_KEY = 'scenelang.market.owned';
const STYLES_KEY = 'scenelang.market.styles';

let catalogCache: MarketItem[] | null = null;

/** The premade catalog as market items — created fresh, never installed by default. */
export function catalogItems(): MarketItem[] {
  if (catalogCache) return catalogCache;
  catalogCache = [
    ...CATALOG_STYLES.map((s, i): MarketItem => ({
      id: s.id,
      kind: 'style',
      title: s.title,
      author: s.author,
      price: 0,
      description: s.description,
      code: s.code,
      official: true,
      createdAt: -(10_000 - i), // catalog first, oldest first for stable order
    })),
    ...CATALOG_TEMPLATES.map((t, i): MarketItem => ({
      id: t.id,
      kind: 'template',
      title: t.title,
      author: t.author,
      price: 0,
      description: t.description,
      code: t.code,
      official: true,
      createdAt: -(100_000 - i),
    })),
    ...CATALOG_EFFECTS.map((f, i): MarketItem => ({
      id: f.id,
      kind: 'effect',
      title: f.title,
      author: f.author,
      price: 0,
      description: f.description,
      code: f.code,
      official: true,
      createdAt: -(200_000 - i),
    })),
  ];
  return catalogCache;
}

/* ------------------------------ storage -------------------------------- */

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / disabled — marketplace stays in-memory
  }
}

/** Everything listed in the marketplace: your items + the full catalog. */
export function loadMarket(): MarketItem[] {
  const stored = read<MarketItem[]>(ITEMS_KEY, []);
  return [...catalogItems(), ...stored].sort((a, b) => a.createdAt - b.createdAt);
}

export function publishItem(item: Omit<MarketItem, 'id' | 'createdAt'>): MarketItem {
  const full: MarketItem = {
    ...item,
    id: `user-${Date.now()}`,
    createdAt: Date.now(),
  };
  const all = read<MarketItem[]>(ITEMS_KEY, []);
  write(ITEMS_KEY, [...all, full]);
  return full;
}

export function isCatalogItem(id: string): boolean {
  return id.startsWith('cat-');
}

export function loadOwned(): string[] {
  return read<string[]>(OWNED_KEY, []);
}

/** Simulated purchase — v1 keeps everything local & free of real payments. */
export function purchaseItem(id: string): string[] {
  const owned = loadOwned();
  if (!owned.includes(id)) {
    owned.push(id);
    write(OWNED_KEY, owned);
  }
  return owned;
}

export function isOwned(id: string): boolean {
  return loadOwned().includes(id);
}

/* --------------------------- installed styles --------------------------- */

export interface InstalledStyle {
  name: string;
  code: string;
}

export function loadInstalledStyles(): InstalledStyle[] {
  return read<InstalledStyle[]>(STYLES_KEY, []);
}

export function saveInstalledStyle(style: InstalledStyle) {
  const all = loadInstalledStyles().filter((s) => s.name !== style.name);
  all.push(style);
  write(STYLES_KEY, all);
}
