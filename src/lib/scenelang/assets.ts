// Imported files — the user's own images, terrains, sprites, dialogue text
// and CSV data. Referenced from SceneLang by file name:
//   image logo.png · sprite hero.png · bg image terrain.jpg
//   lines dialogue.txt · bars from data.csv · pie from data.csv

import type { AssetRef } from './types';

const KEY = 'scenelang.assets';
const MAX_PERSIST_BYTES = 1_400_000; // keep localStorage friendly; larger files live for the session

export function loadAssets(): AssetRef[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AssetRef[]) : [];
  } catch {
    return [];
  }
}

function persist(assets: AssetRef[]) {
  try {
    const keep = assets.filter((a) => (a.dataUrl?.length ?? a.content?.length ?? 0) <= MAX_PERSIST_BYTES);
    window.localStorage.setItem(KEY, JSON.stringify(keep));
  } catch {
    // storage full — assets stay in-memory for this session
  }
}

export function saveAsset(asset: AssetRef): AssetRef[] {
  const all = loadAssets().filter((a) => a.name !== asset.name);
  all.push(asset);
  persist(all);
  return all;
}

export function removeAsset(name: string): AssetRef[] {
  const all = loadAssets().filter((a) => a.name !== name);
  persist(all);
  return all;
}

/** name -> AssetRef map, as the renderer expects it. */
export function assetMap(assets: AssetRef[]): Map<string, AssetRef> {
  return new Map(assets.map((a) => [a.name.toLowerCase(), a]));
}

export function readFileAsAsset(file: File): Promise<AssetRef> {
  return new Promise((resolve, reject) => {
    const lower = file.name.toLowerCase();
    const kind: AssetRef['kind'] = lower.endsWith('.csv') || lower.endsWith('.tsv')
      ? 'csv'
      : /\.(png|jpe?g|gif|webp|svg|avif)$/.test(lower)
        ? 'image'
        : 'text';
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      resolve({
        name: file.name,
        kind,
        dataUrl: kind === 'image' ? result : undefined,
        content: kind === 'image' ? undefined : result,
      });
    };
    reader.onerror = () => reject(new Error(`could not read ${file.name}`));
    if (kind === 'image') reader.readAsDataURL(file);
    else reader.readAsText(file);
  });
}

/** Parse csv/tsv content into chart points. */
export function parseCsvPoints(content: string): { label: string; value: number }[] {
  const out: { label: string; value: number }[] = [];
  for (const raw of content.split('\n').slice(1)) {
    const line = raw.trim();
    if (!line) continue;
    const cells = line.split(/[,;\t]/);
    if (cells.length < 2) continue;
    const label = cells[0].trim();
    const value = parseFloat(cells[1].replace(/[^\d.-]/g, ''));
    if (label && !Number.isNaN(value)) out.push({ label, value });
  }
  return out;
}
