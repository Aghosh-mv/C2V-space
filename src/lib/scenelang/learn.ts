// The Learner — a big library of sections. Every category holds detailed
// tutorials with runnable code for both languages: SceneLang and StyleKit.

export interface Tutorial {
  id: string;
  title: string;
  minutes: number;
  lang: 'scene' | 'style';
  summary: string;
  points: string[];
  code: string;
}

export interface LibrarySection {
  id: string;
  title: string;
  blurb: string;
  tutorials: Tutorial[];
}

const S = (
  id: string,
  title: string,
  minutes: number,
  lang: Tutorial['lang'],
  summary: string,
  points: string[],
  code: string,
): Tutorial => ({ id, title, minutes, lang, summary, points, code });

export const LIBRARY: LibrarySection[] = [
  {
    id: 'start',
    title: 'Start here — SceneLang',
    blurb: 'The four kinds of lines every video is made of. Read these four and you can already ship.',
    tutorials: [
      S('four-lines', 'The four lines every video needs', 3, 'scene',
        'A video is: a size line, a look line, scenes, and elements inside them. That is the whole skeleton.',
        [
          'video sets the canvas: width x height and fps — 1280x720 for landscape, 720x1280 for vertical',
          'theme picks the look — aurora and swiss ship built-in, marketplace styles arrive via import',
          'scene name (4s) opens a scene; its length in seconds is explicit',
          'elements (title, subtitle, text, bars, pie, image…) go on indented lines under the scene',
        ],
        `video 1280x720 30fps
theme aurora

scene hello (4s)
  transition crossfade 0.85s
  title "Hello, video"
    fade in 0.6s
    rise 20 over 0.6s
    stagger words by 100ms
  subtitle "written in a handful of lines"
    type on over 1.4s`),
      S('scenes-time', 'Scenes & time', 3, 'scene',
        'Scenes play back to back in the order you write them. A 10-scene file is a 40-second video if each scene says (4s).',
        [
          'durations are yours: (0.5s) for a flash, (600s) for an ambient hour, anything between',
          'total length = sum of scene lengths — code more, get longer videos',
          'the timeline under the preview shows every scene sized by its duration',
          'scene changes are explicit too: transition crossfade 0.85s (or cut / slide-left / slide-right / zoom)',
        ],
        `video 1280x720 30fps
theme aurora

scene flash (0.6s)
  transition cut
  title "Pop."
    fade in 0.2s

scene breathe (6s)
  transition crossfade 1.2s
  title "Slow down."
    fade in 1.2s
    rise 26 over 1.6s
    stagger words by 200ms
  subtitle "long scenes feel premium"
    fade in 1.4s

scene outro (2s)
  transition zoom 0.7s
  title "Your turn."
    fade in 0.4s`),
      S('elements', 'Every element, one tour', 4, 'scene',
        'Eight building blocks cover everything from ads to lectures. Each is one line of code.',
        [
          'title / subtitle / text — big, medium, body copy',
          'bars {A:1, B:2} and pie {A:1, B:2} — data that presents itself',
          'image and sprite — your imported pictures and characters',
          'shape circle|ring|rect — glassy props for depth',
          'lines dialogue.txt — plays an imported text file line by line (paged dialogue)',
        ],
        `video 1280x720 30fps
theme aurora

scene tour (6s)
  transition crossfade 0.85s
  title "One line each."
    fade in 0.5s
    rise 18 over 0.5s
    stagger words by 90ms
  bars {Fast:88, Smooth:93, Yours:100}
    grow over 0.9s
    stagger items by 120ms
  shape ring
    pulse 5s
  text "charts, props and words share one timeline"
    fade in 0.6s
    wait 400ms
    rise 10 over 0.5s`),
      S('philosophy', 'Name every action', 3, 'scene',
        'v2 has no magic combo words. kinetic did four things at once — now you write the four things, and anything else you want.',
        [
          'one action per line, indented under its element',
          'actions run in parallel; wait is the sequencer',
          'elements cascade gently in order (140ms apart) — the only automatic timing left',
          'old combo words are flagged with hints that show the explicit replacement',
        ],
        `video 1280x720 30fps
theme aurora

scene kinetic-then-v2 (5s)
  transition crossfade 0.85s
  title "Words that move"
    fade in 0.55s
    rise 22 over 0.6s
    stagger words by 90ms
  subtitle "each action, written out"
    fade in 0.5s
    wait 300ms
    rise 12 over 0.5s
    spin 0 over 0.5s`),
    ],
  },
  {
    id: 'actions',
    title: 'Actions in depth',
    blurb: 'The full action vocabulary. Every visual thing that happens is one of these lines.',
    tutorials: [
      S('fade', 'fade in / fade out', 2, 'scene',
        'The breathing of the timeline. Fade anything in when it arrives, out before it leaves.',
        [
          'fade in 0.6s — element is invisible until its moment, then eases up over 0.6s',
          'fade out 0.4s — multiplies on top of the fade-in, so exits are clean',
          'no fade lines? the element is simply present — honest defaults',
        ],
        `video 1280x720 30fps
theme aurora

scene fades (5s)
  transition crossfade 0.85s
  title "In, then out."
    fade in 0.5s
    fade out 0.8s
  subtitle "the body copy arrives late and stays"
    fade in 0.6s
    wait 900ms
  text "you control every entrance and every exit"
    fade in 0.5s
    wait 1600ms
    rise 12 over 0.5s`),
      S('move', 'rise, drop, slide', 3, 'scene',
        'Movement with a distance and a duration. rise 24 over 0.6s lifts 24 pixels, easing out like a settled breath.',
        [
          'rise N over D — drifts up N px · drop N over D — sinks down',
          'slide left N over D / slide right N over D — horizontal moves',
          'distances are small for taste: 10-40px reads premium, 200px reads cartoon',
        ],
        `video 1280x720 30fps
theme swiss

scene moves (5s)
  transition slide-left 0.7s
  title "Slide right in."
    fade in 0.4s
    slide right 60 over 0.7s
  subtitle "drop into place"
    fade in 0.5s
    wait 300ms
    drop 18 over 0.6s
  text "rise feels like relief; drop feels like arrival"
    fade in 0.5s
    wait 700ms
    rise 14 over 0.6s`),
      S('drift-zoom', 'drift & zoom — the Ken Burns pair', 3, 'scene',
        'Slow continuous moves make stills cinematic. drift runs linear across its whole duration — perfect for photos and backgrounds.',
        [
          'drift left|right|up|down N over D — constant-velocity pan',
          'zoom from 100 to 112 over 6s — a slow push-in',
          'combine drift + zoom on an image for the documentary feel',
        ],
        `video 1280x720 30fps
theme aurora

scene cinema (6s)
  transition crossfade 1.2s
  image https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200
    fade in 0.8s
    zoom from 100 to 112 over 6s
    drift right 30 over 6s
  title "Golden hour"
    fade in 1s
    wait 600ms
    rise 16 over 1s
  subtitle "slow push, slow pan"
    fade in 1.2s
    wait 1200ms`),
      S('spin-pulse-bob', 'spin, pulse & bob', 3, 'scene',
        'Rotation and life. spin turns by degrees once; pulse and bob loop forever — they are the idle animations of props and sprites.',
        [
          'spin 360 over 6s — one graceful revolution (negative = counter-clockwise)',
          'pulse 4s — a breathing scale loop; great on shapes and bg',
          'bob 8 over 2s — a floating loop for sprites and characters',
        ],
        `video 1280x720 30fps
theme aurora

scene alive (6s)
  transition crossfade 0.85s
  shape ring
    pulse 4s
    spin 360 over 12s
  shape circle
    pulse 5.5s
  title "Everything idles."
    fade in 0.6s
    rise 18 over 0.6s
    bob 6 over 3s`),
      S('type-on', 'type on — the typewriter', 2, 'scene',
        'type on over 1.4s reveals text character by character with a blinking caret. It is one explicit action now, not a bundled anim.',
        [
          'duration scales the feel: 0.8s is snappy, 2.5s is storytelling',
          'combine with fade in if you want the line to arrive softly first',
          'works on title, subtitle and text',
        ],
        `video 720x1280 30fps
theme aurora

scene story (6s)
  transition crossfade 0.85s
  title "Chapter one."
    fade in 0.5s
  subtitle "and then, quietly, everything changed"
    type on over 2.6s
  text "the caret blinks while it writes"
    fade in 0.5s
    wait 2200ms`),
      S('stagger-wait', 'stagger & wait — choreography', 4, 'scene',
        'stagger splits an element into words, letters or items and offsets each copy of the motion. wait is the pause button between actions.',
        [
          'stagger words by 90ms — the kinetic title, rebuilt from parts you own',
          'stagger letters by 40ms — spell-out energy',
          'stagger items by 120ms — bars and pie legends arrive one by one',
          'wait 400ms delays every action after it — the only sequencing word',
        ],
        `video 1280x720 30fps
theme aurora

scene choreography (6s)
  transition crossfade 0.85s
  title "Every word lands alone"
    fade in 0.5s
    rise 24 over 0.6s
    stagger words by 110ms
  subtitle "letters can spell it out"
    fade in 0.4s
    wait 1200ms
    stagger letters by 40ms
  bars {One:30, Two:60, Three:90}
    fade in 0.4s
    wait 2200ms
    grow over 0.9s
    stagger items by 150ms`),
    ],
  },
  {
    id: 'charts',
    title: 'Charts & data',
    blurb: 'Numbers that present themselves — from inline data or your own CSV files.',
    tutorials: [
      S('bars', 'bars — growing columns', 3, 'scene',
        'bars {Label:12, Label:30} draws rounded columns with values and labels, each easing up.',
        [
          'up to 8 bars; colors come from the theme palette in order',
          'grow over 0.9s sets the growth duration',
          'stagger items by 110ms makes columns land left to right',
        ],
        `video 1280x720 30fps
theme swiss

scene revenue (5s)
  transition crossfade 0.85s
  title "Revenue, rising."
    fade in 0.5s
  bars {Q1:34, Q2:52, Q3:71, Q4:96}
    grow over 1.1s
    stagger items by 140ms
  subtitle "in \$thousands"
    fade in 0.6s`),
      S('pie', 'pie — the sweeping donut', 3, 'scene',
        'pie {A:55, B:30, C:15} draws a donut that sweeps its arcs and a legend with percentages.',
        [
          'up to 6 slices; sweep over 1.1s controls the reveal',
          'stagger items works here too — slices and legend arrive in order',
          'a subtitle under a pie sits at the bottom — put the takeaway there',
        ],
        `video 1280x720 30fps
theme aurora

scene split (5s)
  transition crossfade 0.85s
  pie {Mobile:58, Desktop:31, Tablet:11}
    sweep over 1.3s
    stagger items by 100ms
  subtitle "mobile is the main stage"
    fade in 0.6s`),
      S('csv', 'bars from data.csv — your own numbers', 3, 'scene',
        'Import a .csv with the Import button and feed it straight to a chart. First column = labels, second = values.',
        [
          'click Import above the editor and pick your .csv (or .tsv)',
          'reference it: bars from data.csv — the header row is skipped automatically',
          'pie from data.csv works identically',
          'the file below shows the shape: label,value on each row',
        ],
        `// after importing data.csv with the Import button:
video 1280x720 30fps
theme aurora

scene my-data (5s)
  transition crossfade 0.85s
  title "The quarter, in your numbers."
    fade in 0.5s
  bars from data.csv
    grow over 1s
    stagger items by 120ms
  text "import once, reference forever"
    fade in 0.6s
    wait 400ms`),
    ],
  },
  {
    id: 'files',
    title: 'Files, sprites & terrains',
    blurb: 'Bring your own world: photos, sprite sheets, characters, dialogue text, terrains.',
    tutorials: [
      S('import-files', 'The Import button', 3, 'scene',
        'The paperclip above the editor brings your files into the project. They are referenced by their file name, forever.',
        [
          'images (.png .jpg .webp .svg .gif) become image assets',
          '.txt files become dialogue/text assets, .csv becomes chart data',
          '.scenelang / .stylekit files are appended straight into the editor as code',
          'reference any asset by name: image logo.png — parser errors remind you if it is missing',
        ],
        `// after importing logo.png with the Import button:
video 1280x720 30fps
theme aurora

scene branded (5s)
  transition crossfade 0.85s
  image logo.png
    fade in 0.6s
    rise 16 over 0.6s
  title "Now with your assets."
    fade in 0.5s
    wait 400ms
    stagger words by 100ms`),
      S('sprites', 'sprites & characters', 3, 'scene',
        'sprite places a character or mascot frameless, centered, and free to bob — the idle animation every character deserves.',
        [
          'sprite hero.png draws your PNG without the photo frame',
          'bob 8 over 2s floats it gently, forever',
          'combine with rise / fade for entrances, spin for flourishes',
        ],
        `// after importing hero.png:
video 720x1280 30fps
theme aurora

scene mascot (5s)
  transition crossfade 0.85s
  sprite hero.png
    fade in 0.6s
    rise 24 over 0.8s
    bob 8 over 2.2s
  title "Say hi to Bit."
    fade in 0.5s
    wait 500ms
    stagger words by 110ms`),
      S('terrains', 'terrains as backgrounds', 3, 'scene',
        'bg image fills the whole frame with your picture — maps, landscapes, textures — and takes drift/zoom actions for slow camera moves.',
        [
          'bg image terrain.jpg covers the canvas edge to edge',
          'drift up 30 over 10s — a slow aerial feel',
          'zoom from 100 to 110 over 10s pushes in like a drone',
          'keep text readable: pair busy terrains with the vignette from your style',
        ],
        `// after importing terrain.jpg:
video 1280x720 30fps
theme aurora

scene flyover (8s)
  transition crossfade 1.2s
  bg image terrain.jpg
    zoom from 100 to 110 over 8s
    drift up 26 over 8s
  title "The valley route."
    fade in 1.2s
    wait 800ms
    rise 18 over 1s
  subtitle "ten slow seconds of altitude"
    fade in 1.5s
    wait 1500ms`),
      S('dialogue', 'dialogue from a text file', 3, 'scene',
        'lines dialogue.txt paces an imported text file across the scene: one line at a time, crossfading, with a speaker tick.',
        [
          'one line per subtitle card; blank lines are skipped',
          'the scene duration is divided evenly between the lines',
          'great for interviews, poems, game dialogue, manifestos',
          'fade in on the lines element softens the whole block',
        ],
        `// dialogue.txt holds lines like:
// Mira: the signal is faint
// Joon: then we listen harder
video 1280x720 30fps
theme swiss

scene dialogue (8s)
  transition crossfade 0.85s
  lines dialogue.txt
    fade in 0.5s
  title "Scene 14 — the array"
    fade in 0.5s
    rise 14 over 0.6s`),
    ],
  },
  {
    id: 'mood',
    title: 'Backgrounds, transitions & pacing',
    blurb: 'The stage your elements stand on, and how scenes hand over to each other.',
    tutorials: [
      S('bgs', 'gradient, solid & grid', 2, 'scene',
        'Three built-in stages. gradient blends two colors; solid is one flat color; grid lays dotted mesh (aurora) or graph paper (swiss).',
        [
          'bg gradient #fafafc -> #edeaf7 — the signature aurora wash',
          'bg solid #0f1218 — for dark scenes and music',
          'bg grid — structure and calm for data scenes',
        ],
        `video 1280x720 30fps
theme aurora

scene stages (6s)
  transition crossfade 0.85s
  bg gradient #fafafc -> #edeaf7
    pulse 6s
  title "A living background."
    fade in 0.6s
    rise 18 over 0.6s
    stagger words by 100ms
  text "the aurora blobs breathe behind everything"
    fade in 0.6s
    wait 600ms`),
      S('transitions', 'the four transitions', 3, 'scene',
        'Scene handovers are explicit: transition crossfade 0.85s inside the scene. Pick per scene — cut for punch, crossfade for silk.',
        [
          'crossfade — the default; long ones (1.2s+) feel cinematic',
          'cut — zero transition, hard switch, great for beat drops',
          'slide-left / slide-right — physical, editorial',
          'zoom — gentle push for chapter changes',
        ],
        `video 1280x720 30fps
theme swiss

scene a (3s)
  transition crossfade 1.2s
  title "Silk."
    fade in 0.5s

scene b (3s)
  transition cut
  title "Punch."
    fade in 0.25s

scene c (3s)
  transition slide-right 0.7s
  title "Editorial."
    fade in 0.4s
    slide right 40 over 0.6s`),
      S('pacing', 'pacing & long videos', 3, 'scene',
        'Length is just code. Duplicate scenes to fill minutes, hours, even a full day of ambient signage.',
        [
          'short scenes (2-4s) for social; long (8-15s) for keynotes',
          '600s scenes = ambient billboards; loop them for day-long displays',
          'the compile-time MP4 export renders faster than real time, however long you go',
        ],
        `video 1280x720 30fps
theme midnight-lux

scene ambient-a (30s)
  transition crossfade 1.5s
  bg solid #0e0e16
  shape ring
    pulse 6s
  title "Your brand, all day."
    fade in 1.5s
    rise 20 over 2s
    stagger words by 260ms

scene ambient-b (30s)
  transition crossfade 1.5s
  bg solid #1a1a2e
  shape circle
    pulse 7s
  title "Quiet. Premium. Present."
    fade in 1.5s
    rise 20 over 2s
    stagger words by 260ms`),
    ],
  },
  {
    id: 'stylekit',
    title: 'StyleKit — the style language',
    blurb: 'The second language. Styles declare their own look from scratch — no base to inherit.',
    tutorials: [
      S('no-base', 'No base — declare everything', 3, 'style',
        'A StyleKit style stands on its own. There is no theme to inherit: you say the background, the ink, the accents — or the style does not compile.',
        [
          'style my-look names the style; this name becomes a theme in SceneLang',
          'bg and ink are required — the parser tells you when they are missing',
          'everything else (dim, accents, font, tracking, vignette, orbs) is optional and derived from your ink',
        ],
        `style paper-cut
bg #fbf9f4 -> #efe9dc
ink #262019
accents #b3572d, #6b705c, #262019
font serif
tracking 0.5
vignette 0.08
orbs 3`),
      S('bg-ink', 'bg & ink — the two required lines', 2, 'style',
        'bg is the stage gradient; ink is the text color. Everything else hangs off these two.',
        [
          'bg #fafafc -> #edeaf7 — two colors make a vertical gradient',
          'bg #0e0e16 — one color is a flat stage',
          'ink #16161d — dark ink for light stages, light ink for dark stages',
          'dim is derived automatically at 62% ink unless you set it',
        ],
        `style slate-paper
bg #f4f4f2 -> #e4e4e0
ink #20242a
dim rgba(32, 36, 42, 0.55)
accents #20242a, #b76e79
font sans`),
      S('accents-fonts', 'accents, fonts & tracking', 3, 'style',
        'The accent list feeds chart bars, pie slices and carets. Fonts come in three families; tracking spreads headlines.',
        [
          'accents #7c6cf0, #2bb59a, #16161d — order matters: first accent = first bar',
          'font sans | serif | mono',
          'tracking 1.5 — letter-spacing in px; 2+ feels luxury, 0 feels swiss',
        ],
        `style mint-editorial
bg #f2f7f5 -> #e0ece7
ink #1c2b27
accents #35726b, #7fb3a8, #1c2b27, #c4ded7
font serif
tracking 1.2
vignette 0.06
orbs 4`),
      S('atmosphere', 'atmosphere: vignette, orbs, glow', 2, 'style',
        'The last 5% of polish. vignette darkens edges, orbs float soft bokeh, glow is off — we stay smooth, never neon.',
        [
          'vignette 0.08 — subtle edge shading; 0.25+ for moody night looks',
          'orbs 6 — count of floating light dots; 0 for pure paper',
          'glow on exists but keep it off — glow reads neon and neon is banned here',
        ],
        `style velvet-hour
bg #171321 -> #241d33
ink #f3ecf9
dim rgba(243, 236, 249, 0.62)
accents #c0a8e0, #8f7bb8, #f3ecf9
font serif
tracking 1.5
vignette 0.28
orbs 9`),
      S('publish-import', 'publish, sell & import', 3, 'style',
        'Styles are products. Sell yours on the Marketplace; buy others and import them into any video with one line.',
        [
          'press Sell above the StyleKit editor to list your style (price in USD)',
          'buyers press Import — the style is installed and applied instantly',
          'in code: import midnight-lux above theme midnight-lux',
          'the Apply button paints your current video with this style',
        ],
        `style sunrise-bread
bg #fff4e2 -> #ffe0b8
ink #3d2b1f
accents #e36414, #f0a202, #3d2b1f
font serif
tracking 1
vignette 0.1
orbs 5`),
    ],
  },
  {
    id: 'workflow',
    title: 'Studio workflow',
    blurb: 'Sessions, the two play modes, and shipping to real files.',
    tutorials: [
      S('history', 'History & inimportcode', 3, 'scene',
        'Every save point of your code lives in the History tab with a short session id. Pull any of them back into the editor with one line.',
        [
          'your code is snapshotted automatically while you work',
          'open the History tab — each card shows its id like s-k3m9x2',
          'type inimportcode :s-k3m9x2 anywhere in the editor to pull that version back',
          'the directive resolves, loads the code, and disappears — iterate from any point',
        ],
        `video 1280x720 30fps
theme aurora

scene remember (4s)
  transition crossfade 0.85s
  title "Time travel for code."
    fade in 0.5s
    rise 18 over 0.6s
    stagger words by 100ms
  text "type: inimportcode :your-session-id"
    type on over 1.6s`),
      S('two-modes', 'Animation vs Slideshow', 3, 'scene',
        'One timeline, two playback modes. Animation plays every action; Slideshow shows each scene as a settled, elegant frame.',
        [
          'Animation — the real video, action by action',
          'Slideshow — a presentation: every entrance completed, auto-advance optional',
          'arrow keys flip slides; space toggles play',
          'same code, two deliverables — no separate deck to maintain',
        ],
        `video 1280x720 30fps
theme aurora

scene one (4s)
  transition crossfade 0.85s
  title "Play me two ways."
    fade in 0.5s
    rise 20 over 0.6s
    stagger words by 100ms

scene two (4s)
  transition crossfade 0.85s
  bars {Motion:85, Slides:92}
    grow over 0.9s
    stagger items by 120ms`),
      S('export-video', 'Export MP4 & WebM — compiled, not recorded', 3, 'scene',
        'Export does not record your screen. The compiler renders every frame from your code and encodes it into a real video file.',
        [
          'MP4 — frame-by-frame compile with WebCodecs: faster than real time, deterministic',
          'WebM — quick real-time capture fallback for browsers without WebCodecs',
          'both are real files in your downloads — post them anywhere',
          'Chrome and Edge compile MP4 natively; Safari falls back to WebM',
        ],
        `video 1280x720 30fps
theme aurora

scene ready (4s)
  transition crossfade 0.85s
  title "Hit Export."
    fade in 0.5s
    rise 18 over 0.6s
    stagger words by 110ms
  subtitle "pick MP4 for a compiled file"
    type on over 1.5s`),
      S('export-slides', 'Export PDF & PPTX', 2, 'scene',
        'The same code also ships as documents. Each scene becomes one settled slide — deck and video never drift apart.',
        [
          'PDF — pixel-perfect slides, one page per scene',
          'PPTX — the same slides in an editable deck',
          'the settled frame is used: every entrance finished, nothing mid-motion',
        ],
        `video 1280x720 30fps
theme swiss

scene deck (4s)
  transition crossfade 0.85s
  title "One codebase, every format."
    fade in 0.5s
    rise 18 over 0.6s
    stagger words by 100ms
  bars {Video:100, PDF:100, PPTX:100}
    grow over 0.9s
    stagger items by 130ms`),
    ],
  },
];

export const ALL_TUTORIALS: Tutorial[] = LIBRARY.flatMap((s) => s.tutorials);

export function findTutorial(id: string): { tutorial: Tutorial; section: LibrarySection } | undefined {
  for (const section of LIBRARY) {
    const tutorial = section.tutorials.find((t) => t.id === id);
    if (tutorial) return { tutorial, section };
  }
  return undefined;
}
