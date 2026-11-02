// Marketplace — styles, video templates and videos that creators can
// publish, price, buy (simulated) and import straight into the Studio.

export interface MarketItem {
  id: string;
  kind: 'style' | 'template' | 'video';
  title: string;
  author: string;
  price: number; // 0 = free
  description: string;
  /** StyleKit code for styles, SceneLang code for templates & videos */
  code: string;
  official?: boolean;
  createdAt: number;
}

const ITEMS_KEY = 'scenelang.market.items';
const OWNED_KEY = 'scenelang.market.owned';
const STYLES_KEY = 'scenelang.market.styles';

/* ------------------------- seed the marketplace ------------------------ */

const SEEDS: MarketItem[] = [
  {
    id: 'style-aurora',
    kind: 'style',
    title: 'Aurora',
    author: 'SceneLang',
    price: 0,
    description: 'The signature look — soft light, breathing gradients, glassy calm. Premium PPT energy.',
    official: true,
    createdAt: 0,
    code: `style aurora
base aurora
bg #fafafc -> #edeaf7
ink #16161d
accents #16161d, #7c6cf0, #2bb59a, #f2925c
font sans
tracking 1
vignette 0.08
orbs 7`,
  },
  {
    id: 'style-swiss',
    kind: 'style',
    title: 'Swiss',
    author: 'SceneLang',
    price: 0,
    description: 'Grid, ink, one red accent. If a poster and a spreadsheet had a very tidy child.',
    official: true,
    createdAt: 0,
    code: `style swiss
base swiss
bg #ffffff -> #efefeb
ink #111111
accents #111111, #e63946, #8d8d86
font sans
tracking 0
vignette 0
orbs 0`,
  },
  {
    id: 'style-midnight-lux',
    kind: 'style',
    title: 'Midnight Lux',
    author: 'velvet',
    price: 3,
    description: 'Deep navy silk with lavender and mint accents. Smooth enough for a keynote, rich enough for an ad.',
    createdAt: 1,
    code: `style midnight-lux
base aurora
bg #0e0e16 -> #1a1a2e
ink #f5f3ff
dim rgba(245, 243, 255, 0.66)
accents #c4b5fd, #7dd3c8, #f7c59f, #ffffff
font sans
tracking 1.5
vignette 0.25
orbs 9`,
  },
  {
    id: 'style-sandstone',
    kind: 'style',
    title: 'Sandstone',
    author: 'clay.co',
    price: 0,
    description: 'Warm beige and terracotta. Calm, earthy, Sunday-morning presentation vibes.',
    createdAt: 2,
    code: `style sandstone
base aurora
bg #faf6f0 -> #f3e7d8
ink #3d2f23
accents #b5654a, #8a9a5b, #3d2f23, #d9b08c
font serif
tracking 0.5
vignette 0.1
orbs 4`,
  },
  {
    id: 'style-orchid',
    kind: 'style',
    title: 'Orchid',
    author: 'petal',
    price: 2,
    description: 'Blush pink to lilac, soft serif type. For lookbooks, weddings and gentle launches.',
    createdAt: 3,
    code: `style orchid
base aurora
bg #fdf7fa -> #f2e8f7
ink #40243a
accents #b76e9b, #7c6cf0, #40243a, #e8b4d8
font serif
tracking 1
vignette 0.09
orbs 6`,
  },
  {
    id: 'style-matcha',
    kind: 'style',
    title: 'Matcha',
    author: 'leafstudio',
    price: 0,
    description: 'Green tea calm — mist greens, cream paper, quiet confidence.',
    createdAt: 4,
    code: `style matcha
base aurora
bg #f7faf5 -> #e8f1e4
ink #1f3325
accents #4a7c59, #a3c9a8, #1f3325, #d4a373
font sans
tracking 0.5
vignette 0.08
orbs 5`,
  },
  {
    id: 'style-noir-gold',
    kind: 'style',
    title: 'Noir & Gold',
    author: 'velvet',
    price: 4,
    description: 'Charcoal black with champagne gold. Luxury product ads live here.',
    createdAt: 5,
    code: `style noir-gold
base aurora
bg #101012 -> #1d1c1a
ink #f6f1e7
dim rgba(246, 241, 231, 0.65)
accents #d4af37, #f6f1e7, #9c8244, #ffffff
font serif
tracking 2
vignette 0.3
orbs 8`,
  },
  {
    id: 'tpl-product-ad',
    kind: 'template',
    title: 'Product ad — 30s spot',
    author: 'SceneLang',
    price: 0,
    description: 'Hook, features, social proof, CTA. Swap the words and ship your ad.',
    official: true,
    createdAt: 6,
    code: `video 1280x720 30fps
theme aurora

scene hook (4s) fade
  title "Meet Halo." kinetic
  subtitle "water that thinks ahead" typewriter

scene features (5s) slide-left
  title "Smart. Cold. Forever." kinetic
  bars {Insulation:96, Weight:78, Sync:85} grow

scene cta (4s) zoom-in
  title "Preorder today." kinetic
  subtitle "halo.example.com" typewriter`,
  },
  {
    id: 'tpl-pitch-deck',
    kind: 'template',
    title: 'Investor pitch — Swiss',
    author: 'SceneLang',
    price: 5,
    description: 'Five scenes of clean investor storytelling with animated market bars.',
    official: true,
    createdAt: 7,
    code: `video 1280x720 30fps
theme swiss

scene cover (3.5s) fade
  title "Northwind" pop
  subtitle "logistics, minus the chaos" fade-up

scene market (4.5s) slide-left
  bars {2023:14, 2024:22, 2025:31, 2026:45} grow

scene ask (4s) zoom-in
  title "Raising $2M seed." kinetic
  text "60% engineering · 25% growth · 15% ops" fade`,
  },
  {
    id: 'tpl-day-ad',
    kind: 'template',
    title: 'Ambient day-long ad loop',
    author: 'clay.co',
    price: 8,
    description: 'A slow rotating billboard loop — designed to be stretched across hours. Duplicate scenes to fill a whole day.',
    createdAt: 8,
    code: `// A day-long ambient ad — duplicate blocks to fill hours.
video 1280x720 30fps
theme midnight-lux

scene block-1 (600s) fade
  title "Your brand, all day." kinetic
  bg solid #0e0e16
  shape ring

scene block-2 (600s) fade
  title "Quiet. Premium. Present." kinetic
  bg solid #1a1a2e
  shape circle`,
  },
];

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

export function loadMarket(): MarketItem[] {
  const stored = read<MarketItem[]>(ITEMS_KEY, []);
  const ids = new Set(stored.map((i) => i.id));
  return [...SEEDS.filter((s) => !ids.has(s.id)), ...stored].sort((a, b) => a.createdAt - b.createdAt);
}

export function publishItem(item: Omit<MarketItem, 'id' | 'createdAt'>): MarketItem {
  const full: MarketItem = {
    ...item,
    id: `user-${Date.now()}`,
    createdAt: Date.now(),
  };
  const all = loadMarket();
  write(ITEMS_KEY, [...all.filter((i) => !i.official), full]);
  return full;
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
