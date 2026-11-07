// Marketplace — styles, video templates, effects and videos that creators
// can publish, price (or give away), own and import into the Studio.
// The premade catalog (60+ styles, 240+ templates, 24 effect packs) is
// browsable here and is 100% free — this is a global, premium, free product.
//
// Community listings live on the server (POST /api/market validates the
// code before accepting a listing); this module mirrors them locally so the
// marketplace still opens instantly and works offline.

import { apiFetch, getClientId } from '@/lib/client/api';
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

const ITEMS_KEY = 'scenelang.market.items'; // device-only listings (publish failed / legacy)
const OWNED_KEY = 'scenelang.market.owned';
const STYLES_KEY = 'scenelang.market.styles';
const SERVER_KEY = 'scenelang.market.server'; // last known server listings (offline fallback)

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

/** Device-only listings: legacy publishes or ones the server refused. */
function localItems(): MarketItem[] {
  return read<MarketItem[]>(ITEMS_KEY, []);
}

/**
 * Everything listed in the marketplace: community listings first (newest
 * first — fresh work should be visible, not buried under 330 catalog
 * items), then the official premade catalog in its stable order.
 */
export function loadMarket(): MarketItem[] {
  const cachedServer = read<MarketItem[]>(SERVER_KEY, []);
  const deviceOnly = localItems().filter((l) => !cachedServer.some((s) => s.id === l.id));
  const community = [...deviceOnly, ...cachedServer].sort((a, b) => b.createdAt - a.createdAt);
  return [...community, ...catalogItems()];
}

/** Publish stored only on this device (used when the server is unreachable). */
export function publishItemLocal(item: Omit<MarketItem, 'id' | 'createdAt'>): MarketItem {
  const full: MarketItem = {
    ...item,
    id: `user-${Date.now()}`,
    createdAt: Date.now(),
  };
  write(ITEMS_KEY, [...localItems(), full]);
  return full;
}

export interface PublishResult {
  ok: true;
  item: MarketItem;
  stored: 'server' | 'device';
}
export interface PublishFailure {
  ok: false;
  error: string;
}

/**
 * Publish to the server, which validates the code before accepting.
 * If the server is unreachable the listing is kept on this device and the
 * result says so honestly.
 */
export async function publishItem(input: Omit<MarketItem, 'id' | 'createdAt'>): Promise<PublishResult | PublishFailure> {
  const result = await apiFetch<Omit<MarketItem, 'official'>>('/api/market', {
    method: 'POST',
    body: JSON.stringify({ ...input, clientId: getClientId() }),
  });
  if (result.ok) {
    const listing: MarketItem = { ...result.data, official: false };
    const cache = read<MarketItem[]>(SERVER_KEY, []).filter((l) => l.id !== listing.id);
    write(SERVER_KEY, [listing, ...cache].slice(0, 500));
    return { ok: true, item: listing, stored: 'server' };
  }
  // validation failures are final; network failures keep the listing locally
  const validation = /name is required|under \d+ characters|no name line|no base|does not parse|no scenes|no code|control characters|over 128 KB/i.test(
    result.error,
  );
  if (validation) return { ok: false, error: result.error };
  const local = publishItemLocal(input);
  return { ok: true, item: local, stored: 'device' };
}

/** Refresh community listings from the server; null while offline. */
export async function fetchServerListings(): Promise<MarketItem[] | null> {
  const result = await apiFetch<{ listings: Omit<MarketItem, 'official'>[] }>('/api/market');
  if (!result.ok) return null;
  const listings: MarketItem[] = result.data.listings.map((l) => ({ ...l, official: false }));
  write(SERVER_KEY, listings);
  return listings;
}

export function isCatalogItem(id: string): boolean {
  return id.startsWith('cat-');
}

/** Server-published listings are identified by a cuid (not cat-/user-). */
export function isServerItem(id: string): boolean {
  return !id.startsWith('cat-') && !id.startsWith('user-');
}

export function loadOwned(): string[] {
  return read<string[]>(OWNED_KEY, []);
}

/**
 * Record ownership. Server listings get a durable server-side entitlement
 * (best-effort — the local record is the fallback). Official catalog items
 * are free for everyone and stay local.
 */
export function purchaseItem(id: string): string[] {
  const owned = loadOwned();
  if (!owned.includes(id)) {
    owned.push(id);
    write(OWNED_KEY, owned);
  }
  if (isServerItem(id)) {
    void apiFetch(`/api/market/${encodeURIComponent(id)}/purchase`, {
      method: 'POST',
      body: JSON.stringify({ clientId: getClientId() }),
    });
  }
  return owned;
}

/** Merge the durable server entitlements into the local list. */
export async function pullOwnedFromServer(): Promise<string[] | null> {
  const result = await apiFetch<{ owned: string[] }>(
    '/api/market/owned?clientId=' + encodeURIComponent(getClientId()),
  );
  if (!result.ok) return null;
  const merged = [...new Set([...loadOwned(), ...result.data.owned])];
  write(OWNED_KEY, merged);
  return merged;
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
