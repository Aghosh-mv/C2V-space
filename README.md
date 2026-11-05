# C2V space — code that becomes video

Write plain-word code. The compiler computes every frame and films it into a **real video file** — not a screen recording. Everything runs locally in your browser: no accounts, no servers, no uploads.

## What's inside

| Surface | What it does |
| --- | --- |
| **Studio** | Two editors side by side: SceneLang (scenes) and StyleKit (looks), with a live player, timeline and one-click exports (MP4, WebM, PDF, PPTX). |
| **SceneLang** | A tiny scene language — `video`, `theme`, `scene`, then one action per line (`fade in`, `rise 22 over 0.6s`, `stagger words by 90ms`). No default style, no sample code: you start from a blank canvas. |
| **StyleKit** | A style language with **no default base** — declare `bg` and `ink` yourself, then shape accents, fonts and atmosphere. Apply it to your video or sell it. |
| **History** | Every few seconds your code is snapshotted with a session id. Type `inimportcode :<id>` in the editor to pull any version back and iterate. |
| **Learner** | A big library: seven sections of detailed tutorials and copy-paste examples covering both languages. |
| **Marketplace** | 62 premade styles, 243 templates and 24 effect packs — all free. Publish your own styles and templates with `import`-able names. |

## Highlights

- **Blank by default** — no templates, no styles, no pre-written code.
- **Real exports** — MP4 is compiled frame-by-frame with WebCodecs (no recording); WebM as a real-time fallback; PDF and PPTX render one slide per scene.
- **Your files** — import images, sprites, dialogue text, CSV data and `.scenelang` / `.stylekit` code; reference them directly from the language (`image logo.png`, `bars from data.csv`).
- **Length without limits** — scenes up to an hour, videos up to a full day.
- **Keyboard first** — `Space` plays, `↑`/`↓` flip slides, `Tab` indents in the editor.

## Run it

```bash
bun install
bun run dev      # http://localhost:3000
bun run lint
bun run build    # production build (standalone)
```

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · WebCodecs + mp4-muxer · ffmpeg.wasm fallback · jsPDF · pptxgenjs
