'use client';

// Marketplace — buy & sell styles, video templates and videos.
// The premade catalog (60+ styles, 240+ templates) is browsable here;
// nothing is installed until you choose it. Community listings are
// published through the server, which validates the code before accepting.

import { useEffect, useMemo, useState } from 'react';
import { Check, CloudDownload, Download, Gem, LayoutTemplate, Loader2, Search, Store, Tag, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  fetchServerListings,
  isCatalogItem,
  isOwned,
  loadMarket,
  loadOwned,
  type MarketItem,
  pullOwnedFromServer,
  publishItem,
  purchaseItem,
} from '@/lib/scenelang/market';
import { loadSavedAuthor, MAX_AUTHOR, MAX_DESCRIPTION, MAX_TITLE, saveAuthor } from '@/lib/scenelang/publish-limits';
import { parseStyleKit } from '@/lib/scenelang/stylekit';
import { cn } from '@/lib/utils';
import { MiniThumb } from './mini-thumb';
import type { AssetRef } from '@/lib/scenelang/types';

interface Props {
  onImportStyle: (code: string, name: string) => void;
  onLoadTemplate: (code: string) => void;
  onImportEffect: (code: string) => void;
  assets: AssetRef[];
}

function StyleSwatches({ code }: { code: string }) {
  const { tokens } = useMemo(() => parseStyleKit(code), [code]);
  if (!tokens) return <div className="h-28 rounded-2xl bg-zinc-100" />;
  return (
    <div
      className="flex h-28 flex-col justify-between rounded-2xl border p-3"
      style={{ background: `linear-gradient(160deg, ${tokens.bg[0]}, ${tokens.bg[1]})` }}
    >
      <span style={{ color: tokens.text }} className="text-[15px] font-semibold tracking-wide">
        Aa — big idea
      </span>
      <div className="flex gap-1.5">
        {tokens.palette.map((c, i) => (
          <span key={i} className="h-6 w-6 rounded-full border shadow-sm" style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}

function KindBadge({ kind }: { kind: MarketItem['kind'] }) {
  const map = {
    style: { icon: Gem, label: 'style' },
    template: { icon: LayoutTemplate, label: 'template' },
    video: { icon: Store, label: 'video' },
    effect: { icon: Sparkles, label: 'effect' },
  } as const;
  const { icon: Icon, label } = map[kind];
  return (
    <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

const PAGE = 24;

export function Marketplace({ onImportStyle, onLoadTemplate, onImportEffect, assets }: Props) {
  const [items, setItems] = useState<MarketItem[]>(() => loadMarket());
  const [owned, setOwned] = useState<string[]>(() => loadOwned());
  const [sync, setSync] = useState<'syncing' | 'live' | 'offline'>('syncing');
  const [filter, setFilter] = useState<'all' | 'style' | 'template' | 'video' | 'effect'>('all');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<MarketItem | null>(null);
  const [shownCount, setShownCount] = useState(PAGE);

  // pull community listings + durable entitlements from the server;
  // the local mirror keeps the grid instant and offline-safe
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [listings, ownedFromServer] = await Promise.all([fetchServerListings(), pullOwnedFromServer()]);
      if (cancelled) return;
      setSync(listings === null ? 'offline' : 'live');
      setItems(loadMarket());
      if (ownedFromServer) setOwned(ownedFromServer);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const matched = items.filter(
    (i) =>
      (filter === 'all' || i.kind === filter) &&
      (query.trim() === '' ||
        `${i.title} ${i.description} ${i.author}`.toLowerCase().includes(query.toLowerCase())),
  );
  const shown = matched.slice(0, shownCount);

  const buy = (item: MarketItem) => {
    const next = purchaseItem(item.id);
    setOwned([...next]);
    toast.success(`“${item.title}” is yours — added to your library`);
  };

  const importNow = (item: MarketItem) => {
    if (item.kind === 'style') {
      onImportStyle(item.code, item.title);
    } else if (item.kind === 'effect') {
      onImportEffect(item.code);
    } else {
      onLoadTemplate(item.code);
    }
    setDetail(null);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-5">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
          <Store className="h-5 w-5 text-violet-600" /> Marketplace
        </h1>
        <p className="mt-1 text-[13.5px] text-zinc-500">
          A global, premium, free catalog — every premade style, template and effect pack is free. Creators can still price their own work.
        </p>
      </div>

      <div aria-live="polite" className="mb-3 flex items-center gap-1.5 text-[11.5px] text-zinc-400">
        {sync === 'syncing' ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" /> syncing with the server…
          </>
        ) : sync === 'live' ? (
          <>
            <CloudDownload className="h-3 w-3 text-emerald-600" /> live — community listings are synced
          </>
        ) : (
          <>
            <CloudDownload className="h-3 w-3 text-amber-600" /> offline — showing the last synced copy
          </>
        )}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShownCount(PAGE);
            }}
            placeholder="Search the marketplace…"
            className="rounded-full pl-9"
          />
        </div>
        <div className="flex rounded-full border bg-white p-1 shadow-sm">
          {(['all', 'style', 'template', 'effect', 'video'] as const).map((f) => {
            const count = f === 'all' ? items.length : items.filter((i) => i.kind === f).length;
            return (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setFilter(f);
                  setShownCount(PAGE);
                }}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-[12.5px] font-medium capitalize transition-all',
                  filter === f ? 'bg-violet-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-800',
                )}
              >
                {f === 'all' ? 'everything' : f === 'effect' ? 'effects' : `${f}s`} · {count}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setDetail(item)}
            className="group overflow-hidden rounded-3xl border bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="h-32 border-b bg-zinc-50">
              {item.kind === 'style' ? (
                <div className="h-full w-full p-3">
                  <StyleSwatches code={item.code} />
                </div>
              ) : (
                <MiniThumb code={item.code} assets={assets} />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <KindBadge kind={item.kind} />
                {isCatalogItem(item.id) ? (
                  <span className="flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10.5px] font-semibold text-violet-700">
                    <Sparkles className="h-2.5 w-2.5" /> premade
                  </span>
                ) : item.official ? (
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10.5px] font-semibold text-violet-700">official</span>
                ) : (
                  <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10.5px] font-semibold text-teal-700">community</span>
                )}
                <span className="ml-auto flex items-center gap-0.5 text-[13px] font-semibold text-zinc-800">
                  <Tag className="h-3 w-3 text-zinc-400" />
                  {item.price === 0 ? 'Free' : `$${item.price}`}
                </span>
              </div>
              <p className="mt-2 text-[14.5px] font-semibold text-zinc-900">{item.title}</p>
              <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-zinc-500">{item.description}</p>
              <p className="mt-2 text-[11.5px] text-zinc-400">by {item.author}</p>
            </div>
          </button>
        ))}
        {shown.length === 0 && (
          <p className="col-span-full rounded-3xl border border-dashed bg-white/60 px-4 py-10 text-center text-[13.5px] text-zinc-400">
            Nothing matches — try another search, or publish something from the Studio!
          </p>
        )}
      </div>

      {shownCount < matched.length && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => setShownCount((n) => n + PAGE)}
          >
            Load more ({matched.length - shownCount} left)
          </Button>
        </div>
      )}

      {/* detail dialog */}
      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent aria-describedby={undefined} className="max-w-2xl rounded-3xl">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 pr-8 text-lg">
                  <KindBadge kind={detail.kind} />
                  {detail.title}
                </DialogTitle>
              </DialogHeader>
              <div className="h-48 overflow-hidden rounded-2xl border bg-zinc-50">
                {detail.kind === 'style' ? (
                  <div className="h-full w-full p-4">
                    <StyleSwatches code={detail.code} />
                  </div>
                ) : (
                  <MiniThumb code={detail.code} assets={assets} />
                )}
              </div>
              <p className="text-[13.5px] leading-relaxed text-zinc-600">{detail.description}</p>
              <p className="text-[12px] text-zinc-400">
                by {detail.author} · {detail.price === 0 ? 'Free' : `$${detail.price}`} ·{' '}
                {detail.kind === 'style' ? 'StyleKit' : 'SceneLang'} code included
              </p>
              <pre className="max-h-44 overflow-auto rounded-2xl bg-zinc-50 p-4 font-mono text-[11.5px] leading-relaxed text-zinc-600">
                {detail.code}
              </pre>
              <div className="flex flex-wrap justify-end gap-2">
                {!owned.includes(detail.id) ? (
                  <Button
                    onClick={() => buy(detail)}
                    className="rounded-full bg-violet-600 text-white hover:bg-violet-700"
                  >
                    {detail.price === 0 ? 'Get — free' : `Buy for $${detail.price}`}
                  </Button>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[12.5px] font-medium text-emerald-700">
                    <Check className="h-3.5 w-3.5" /> in your library
                  </span>
                )}
                <Button
                  variant="outline"
                  disabled={!owned.includes(detail.id)}
                  onClick={() => importNow(detail)}
                  className="gap-2 rounded-full"
                >
                  <Download className="h-4 w-4" />
                  {detail.kind === 'style'
                    ? 'Import into my video'
                    : detail.kind === 'effect'
                      ? 'Add effect to my video'
                      : 'Open in Studio'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --------------------------- publish dialog ---------------------------- */

interface PublishProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: 'style' | 'template' | 'video';
  code: string;
  defaultTitle?: string;
  onPublished?: () => void;
}

export function PublishDialog({ open, onOpenChange, kind, code, defaultTitle, onPublished }: PublishProps) {
  const [title, setTitle] = useState(defaultTitle ?? '');
  const [author, setAuthor] = useState(() => loadSavedAuthor());
  const [price, setPrice] = useState('0');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  // the parent remounts this dialog via `key` when the kind changes,
  // so fields always start fresh

  const publish = async () => {
    if (!title.trim()) {
      toast.error('Give your listing a name first.');
      return;
    }
    if (!author.trim()) {
      toast.error('Tell the marketplace who made it — an author name is required.');
      return;
    }
    if (!code.trim()) {
      toast.error('This listing has no code yet — write it first.');
      return;
    }
    setBusy(true);
    const result = await publishItem({
      kind,
      title: title.trim().slice(0, MAX_TITLE),
      author: author.trim().slice(0, MAX_AUTHOR),
      price: Math.max(0, Math.min(999, Math.round(Number(price) || 0))),
      description: description.trim().slice(0, MAX_DESCRIPTION) || (kind === 'style' ? 'A custom StyleKit look.' : 'A SceneLang creation.'),
      code,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    saveAuthor(author.trim());
    if (result.stored === 'server') {
      toast.success(`“${result.item.title}” is live on the Marketplace — validated and published`);
    } else {
      toast.info(`“${result.item.title}” was saved on this device — the server was unreachable, it stays local for now`);
    }
    onOpenChange(false);
    onPublished?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Publish {kind === 'style' ? 'style' : kind === 'template' ? 'video template' : 'video'} to the Marketplace
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label htmlFor="publish-name" className="mb-1 block text-[12.5px] font-medium text-zinc-600">
              Name <span className="text-zinc-400">({title.length}/{MAX_TITLE})</span>
            </label>
            <Input
              id="publish-name"
              value={title}
              maxLength={MAX_TITLE}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={kind === 'style' ? 'e.g. cloud-nine' : 'e.g. Coffee shop ad'}
              className="rounded-2xl"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="publish-author" className="mb-1 block text-[12.5px] font-medium text-zinc-600">
              Your creator name <span className="text-zinc-400">({author.length}/{MAX_AUTHOR})</span>
            </label>
            <Input
              id="publish-author"
              value={author}
              maxLength={MAX_AUTHOR}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. nova"
              className="rounded-2xl"
            />
          </div>
          <div>
            <label htmlFor="publish-price" className="mb-1 block text-[12.5px] font-medium text-zinc-600">
              Price in USD (0 = free)
            </label>
            <Input
              id="publish-price"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ''))}
              className="rounded-2xl"
            />
          </div>
          <div>
            <label htmlFor="publish-desc" className="mb-1 block text-[12.5px] font-medium text-zinc-600">
              Description <span className="text-zinc-400">({description.length}/{MAX_DESCRIPTION})</span>
            </label>
            <Textarea
              id="publish-desc"
              value={description}
              maxLength={MAX_DESCRIPTION}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes it special?"
              className="min-h-20 rounded-2xl"
            />
          </div>
          <p className="rounded-2xl bg-zinc-50 p-3 text-[11.5px] leading-relaxed text-zinc-500">
            Publishing is free. Your code is checked by the server before the listing goes live, and buyers get a durable
            entitlement in their library. Paid checkout is not wired to a payment processor yet — priced listings record
            ownership without moving money.
          </p>
          <Button
            onClick={() => void publish()}
            disabled={busy}
            className="w-full rounded-full bg-violet-600 text-white hover:bg-violet-700"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Validating &amp; publishing…
              </>
            ) : (
              'Publish to Marketplace'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
