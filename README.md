# C2V space — code that becomes video

Write plain-word code. The compiler computes every frame and films it into a **real video file** — not a screen recording. Rendering runs entirely in your browser; a small server keeps a durable, anonymous copy of your work behind the scenes.

## What's inside

| Surface | What it does |
| --- | --- |
| **Studio** | Two editors side by side: SceneLang (scenes) and StyleKit (looks), with a live player, timeline and one-click exports (MP4, WebM, PDF, PPTX). |
| **SceneLang** | A tiny scene language — `video`, `theme`, `scene`, then one action per line (`fade in`, `rise 22 over 0.6s`, `stagger words by 90ms`). No default style, no sample code: you start from a blank canvas. |
| **StyleKit** | A style language with **no default base** — declare `bg` and `ink` yourself, then shape accents, fonts and atmosphere. Apply it to your video or sell it. |
| **History** | Every few seconds your code is snapshotted with a session id. Type `inimportcode :<id>` in the editor to pull any version back and iterate. Snapshots are kept locally and mirrored to the server (newest 200). |
| **Learner** | A big library: seven sections of detailed tutorials and copy-paste examples covering both languages. |
| **Marketplace** | 62 premade styles, 243 templates and 24 effect packs — all free. Publish your own styles and templates with `import`-able names; the server validates every listing before it goes live. |

## How it works

- **Frontend** — Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · WebCodecs + mp4-muxer · ffmpeg.wasm fallback · jsPDF · pptxgenjs. Every frame of every export is computed in your browser.
- **Backend** — Next.js API routes + Prisma on SQLite:

  | Route | What it does |
  | --- | --- |
  | `GET /api` | Health probe (app, version, uptime timestamp). |
  | `GET/PUT /api/sync` | Durable cloud mirror of your two editors, keyed by an anonymous client id. Local edits always win; a cleared browser is restored from here. |
  | `GET/POST/DELETE /api/sessions` | History snapshots, capped at the newest 200 per client. |
  | `GET/POST /api/market` | Community listings. POST validates metadata (zod) **and parses the code server-side** before accepting; rejects broken listings with a real message. |
  | `GET /api/market/owned`, `POST /api/market/:id/purchase` | Durable entitlements ("this listing is mine"). |

- **Anonymous by default** — no accounts, no emails, no tracking. Your browser keeps a random client id; the server knows nothing else about you. Imported media files never leave your device. Details in `/legal`.

## Honesty notes

- Marketplace checkout is not wired to a payment processor: priced listings record ownership without moving money. The premade catalog is free for everyone, forever.
- The rate limiter is in-memory and per-instance — right-sized for this deployment, not a distributed one.

## Run it

```bash
cp .env.example .env
bun install
bun run db:push    # create/sync the SQLite database
bun run dev        # http://localhost:3000
bun run lint
bun run build      # production build (standalone)
```

## Stack

Next.js 16 (API routes) · React 19 · TypeScript (strict) · Prisma + SQLite · Tailwind CSS 4 · shadcn/ui · WebCodecs + mp4-muxer · ffmpeg.wasm · jsPDF · pptxgenjs
