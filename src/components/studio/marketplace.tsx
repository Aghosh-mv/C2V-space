'use client';

// Marketplace — buy & sell styles, video templates and videos.
// Payments are simulated in v1 (everything is local); the flow is real.

import { useMemo, useState } from 'react';
import { Check, Download, Gem, LayoutTemplate, Search, Store, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { isOwned, loadMarket, loadOwned, publishItem, purchaseItem, type MarketItem } from '@/lib/scenelang/market';
import { parseStyleKit } from '@/lib/scenelang/stylekit';
import { cn } from '@/lib/utils';
import { MiniThumb } from './mini-thumb';

interface Props {
  onImportStyle: (code: string, name: string) => void;
  onLoadTemplate: (code: string) => void;
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
  } as const;
  const { icon: Icon, label } = map[kind];
  return (
    <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

export function Marketplace({ onImportStyle, onLoadTemplate }: Props) {
  const [items, setItems] = useState<MarketItem[]>(() => loadMarket());
  const [owned, setOwned] = useState<string[]>(() => loadOwned());
  const [filter, setFilter] = useState<'all' | 'style' | 'template' | 'video'>('all');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<MarketItem | null>(null);

  const shown = items.filter(
    (i) =>
      (filter === 'all' || i.kind === filter) &&
      (query.trim() === '' ||
        `${i.title} ${i.description} ${i.author}`.toLowerCase().includes(query.toLowerCase())),
  );

  const buy = (item: MarketItem) => {
    const next = purchaseItem(item.id);
    setOwned([...next]);
    if (item.price === 0) toast.success(`“${item.title}” added to your library`);
    else toast.success(`Purchased “${item.title}” for $${item.price} (demo checkout) — it's yours`);
  };

  const importNow = (item: MarketItem) => {
    if (item.kind === 'style') {
      onImportStyle(item.code, item.title);
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
          Buy styles and templates from other creators — or publish your own from the Studio and sell them.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the marketplace…"
            className="rounded-full pl-9"
          />
        </div>
        <div className="flex rounded-full border bg-white p-1 shadow-sm">
          {(['all', 'style', 'template', 'video'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-[12.5px] font-medium capitalize transition-all',
                filter === f ? 'bg-violet-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-800',
              )}
            >
              {f === 'all' ? 'everything' : `${f}s`}
            </button>
          ))}
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
                <MiniThumb code={item.code} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <KindBadge kind={item.kind} />
                {item.official && (
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10.5px] font-semibold text-violet-700">
                    official
                  </span>
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
            Nothing here yet — publish something from the Studio!
          </p>
        )}
      </div>

      {/* detail dialog */}
      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-2xl rounded-3xl">
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
                  <MiniThumb code={detail.code} className="h-full w-full object-cover" />
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
                  {detail.kind === 'style' ? 'Import into my video' : 'Open in Studio'}
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
  const [price, setPrice] = useState('0');
  const [description, setDescription] = useState('');
  // the parent remounts this dialog via `key` when the kind changes,
  // so fields always start fresh

  const publish = () => {
    if (!title.trim()) {
      toast.error('Give your listing a name first.');
      return;
    }
    publishItem({
      kind,
      title: title.trim(),
      author: 'you',
      price: Math.max(0, Math.min(999, Number(price) || 0)),
      description: description.trim() || (kind === 'style' ? 'A custom StyleKit look.' : 'A SceneLang creation.'),
      code,
    });
    toast.success(`“${title.trim()}” is live on the Marketplace!`);
    onOpenChange(false);
    onPublished?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Publish {kind === 'style' ? 'style' : kind === 'template' ? 'video template' : 'video'} to the Marketplace
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[12.5px] font-medium text-zinc-600">Name</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={kind === 'style' ? 'e.g. cloud-nine' : 'e.g. Coffee shop ad'} className="rounded-2xl" />
          </div>
          <div>
            <label className="mb-1 block text-[12.5px] font-medium text-zinc-600">Price in USD (0 = free)</label>
            <Input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ''))} className="rounded-2xl" />
          </div>
          <div>
            <label className="mb-1 block text-[12.5px] font-medium text-zinc-600">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What makes it special?" className="min-h-20 rounded-2xl" />
          </div>
          <p className="rounded-2xl bg-zinc-50 p-3 text-[11.5px] leading-relaxed text-zinc-500">
            v1 checkout is simulated locally — no real payments yet. Your listing appears instantly for you to import or sell.
          </p>
          <Button onClick={publish} className="w-full rounded-full bg-violet-600 text-white hover:bg-violet-700">
            Publish to Marketplace
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
