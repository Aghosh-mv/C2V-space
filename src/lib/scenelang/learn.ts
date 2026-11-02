// Learn library — bite-sized lessons that teach the SceneLang language.

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  summary: string;
  points: string[];
  code: string;
}

export const LESSONS: Lesson[] = [
  {
    id: 'basics',
    title: '1 · The four lines every video needs',
    minutes: 2,
    summary:
      'SceneLang is plain sentences. A video is a list of scenes; each scene is a list of elements. Four kinds of lines do all the work.',
    points: [
      'video 1280x720 30fps — the canvas size and speed. Try 720x1280 for phone videos.',
      'theme aurora — the look. aurora = smooth & premium, swiss = clean minimal.',
      'scene name (4s) fade — one slide of your video: a name, a duration, and how it enters.',
      'Elements are the lines INSIDE a scene, indented by two spaces.',
    ],
    code: `video 1280x720 30fps
theme aurora

scene hello (4s) fade
  title "Hello, video" kinetic
  subtitle "written in four lines" typewriter`,
  },
  {
    id: 'text',
    title: '2 · Words that move',
    minutes: 3,
    summary:
      'Every text element takes an animation keyword. It is the last word on the line. Swap it and watch the feel change.',
    points: [
      'kinetic — each word rises into place, one after another. Great for titles.',
      'typewriter — letters appear like being typed, with a soft caret.',
      'pop — the whole line settles in with a gentle scale.',
      'fade-up — drifts up while appearing. The calm one.',
      'fade — a pure silky crossfade.',
    ],
    code: `video 1280x720 30fps
theme aurora

scene one (3s) fade
  title "Words in motion" kinetic
  subtitle "typed right before your eyes" typewriter

scene two (3s) fade
  title "Gently does it" pop
  text "fade-up keeps everything calm and premium" fade-up`,
  },
  {
    id: 'scenes',
    title: '3 · Scenes, timing and transitions',
    minutes: 3,
    summary:
      'The duration in brackets sets the scene length; the keyword after it sets how the scene enters. The video is as long as your code is big.',
    points: [
      'scene name (0.5s to 60s) — any length per scene, up to 5 minutes per video.',
      'Enter keywords: fade, fade-up, slide-left, slide-right, zoom-in.',
      'The previous scene melts away behind each entrance — transitions are automatic.',
      'Rename scenes anything you like; the name is your label on the timeline.',
    ],
    code: `video 1280x720 30fps
theme aurora

scene opening (3s) fade
  title "Three ways in" kinetic

scene glide (3s) slide-left
  subtitle "this one glides sideways" fade

scene landing (3s) zoom-in
  subtitle "and this one breathes in" fade-up`,
  },
  {
    id: 'backgrounds',
    title: '4 · Backgrounds & moods',
    minutes: 2,
    summary:
      'One bg line per scene sets the stage. If you skip it, the theme quietly provides a premium default.',
    points: [
      'bg gradient #fafafc -> #edeaf7 — any two colors, top to bottom.',
      'bg solid #ffffff — one flat color.',
      'bg grid — a soft dotted mesh (aurora) or graph paper (swiss).',
      'Add pulse at the end to make gradients breathe.',
    ],
    code: `video 1280x720 30fps
theme aurora

scene mist (3.5s) fade
  bg gradient #fafafc -> #edeaf7 pulse
  title "Soft by default" kinetic

scene paper (3.5s) fade
  bg grid
  title "Dotted mesh stage" pop

scene bold (3.5s) fade
  bg solid #16161d
  title "Dark mode, lightly" kinetic`,
  },
  {
    id: 'charts',
    title: '5 · Numbers that present themselves',
    minutes: 3,
    summary:
      'Bars and pies are single lines. The data lives in curly braces, and the motion is built in.',
    points: [
      'bars {Mon:12, Tue:30} grow — bars rise one by one, softly staggered.',
      'pie {Yes:55, No:45} spin — a donut sweeps in, legend fades up beside it.',
      'Values can be any numbers; labels can be any short words.',
      'Up to 8 bars and 6 pie slices.',
    ],
    code: `video 1280x720 30fps
theme aurora

scene numbers (5s) fade-up
  title "The quarter" pop
  bars {Q1:34, Q2:52, Q3:61, Q4:88} grow

scene split (4.5s) fade
  pie {Aurora:55, Swiss:30, More:15} spin
  subtitle "share of watch time" fade`,
  },
  {
    id: 'props',
    title: '6 · Pictures and glass shapes',
    minutes: 3,
    summary:
      'Images get a premium frame, soft shadow and a slow Ken Burns drift. Shapes are decor you can layer behind text.',
    points: [
      'image https://... zoom-in — pastes a photo in a rounded, shadowed frame.',
      'Use pan instead of zoom-in for a sideways drift. Broken links show a neat placeholder.',
      'shape circle — a breathing glass disc behind your title.',
      'shape ring — a thin elegant ring. shape rect — a full glass frame.',
    ],
    code: `video 1280x720 30fps
theme aurora

scene framed (4s) fade
  shape circle
  title "Glass & light" kinetic
  subtitle "decor is one word deep" typewriter

scene ring (3.5s) fade
  shape ring
  subtitle "keep it minimal" fade-up`,
  },
  {
    id: 'slides-export',
    title: '7 · Slideshow mode & exports',
    minutes: 2,
    summary:
      'The same code plays two ways: press Play for the animation, or switch to Slideshow to flip scene by scene like a premium deck.',
    points: [
      'Slideshow shows every scene fully settled — perfect for presenting.',
      'Auto-advance flips scenes using each scene\'s duration.',
      'Export MP4 to COMPILE your code into a real video file — frame by frame, no recording.',
      'Export PDF or PPTX to get one beautiful slide per scene.',
    ],
    code: `video 1280x720 30fps
theme aurora

scene agenda (4s) fade-up
  title "Tonight" kinetic
  bars {Demo:40, Numbers:35, Pizza:25} grow

scene thanks (3s) zoom-in
  title "Questions?" kinetic`,
  },
];

/** StyleKit lessons — the second language. */
export const STYLEKIT_LESSONS: Lesson[] = [
  {
    id: 'sk-basics',
    title: '1 · What is a style?',
    minutes: 2,
    summary:
      'StyleKit is the second language. A style is a look — colors, ink, type, motion feel. The Studio ships with aurora and swiss; StyleKit lets you invent your own and sell them.',
    points: [
      'A style file starts with:  style my-style-name',
      'base aurora — inherit the smooth premium engine, then override what you like.',
      'Use it in a video with:  theme my-style-name',
      'Styles are tiny — 6 to 10 short lines.',
    ],
    code: `style cloud-nine
base aurora
bg #fbfdff -> #e8f0fa
ink #1d2b3a
accents #1d2b3a, #5b8def, #f2a65a, #6ecb63
font sans
tracking 1`,
  },
  {
    id: 'sk-colors',
    title: '2 · Colors, ink and feel',
    minutes: 3,
    summary:
      'Four words paint everything: bg paints the stage, ink is the main text color, accents feed charts and highlights, dim softens secondary text.',
    points: [
      'bg #faf6f0 -> #f3e7d8 — two colors, top to bottom.',
      'ink #3d2f23 — titles and strong text.',
      'accents #b5654a, #8a9a5b — comma-separated; bars & pies cycle through them.',
      'dim rgba(61,47,35,0.6) — secondary text color.',
    ],
    code: `style terracotta
base aurora
bg #faf6f0 -> #f3e7d8
ink #3d2f23
dim rgba(61, 47, 35, 0.6)
accents #b5654a, #8a9a5b, #3d2f23, #d9b08c
font serif`,
  },
  {
    id: 'sk-feel',
    title: '3 · Type, glow and atmosphere',
    minutes: 3,
    summary:
      'The feel words control the motion mood. Keep glow off for clean light looks; turn it on for rich dark styles where text and charts softly radiate.',
    points: [
      'font sans, serif or mono — the whole typography system.',
      'tracking 1.5 — letter-spacing in pixels, for that airy premium feel.',
      'glow off | on — soft light radiation on charts and shapes.',
      'vignette 0.25 — darkens corners subtly. orbs 9 — floating bokeh dust.',
    ],
    code: `style noir-gold
base aurora
bg #101012 -> #1d1c1a
ink #f6f1e7
accents #d4af37, #f6f1e7, #9c8244
font serif
tracking 2
glow on
vignette 0.3
orbs 8`,
  },
  {
    id: 'sk-market',
    title: '4 · Publish, sell, import',
    minutes: 2,
    summary:
      'A style is a product. Publish it to the Marketplace with a price, and anyone who buys it can import it into their own videos with one word.',
    points: [
      'Open the Style tab in the Studio and press "Publish style".',
      'Buyers press Get / Buy, then Import — the Studio adds the import line for them.',
      'In any video:  import midnight-lux  then  theme midnight-lux',
      'Video templates and videos can be listed too — sell the whole thing, not just the look.',
    ],
    code: `// In a SceneLang video, borrowed styles are one word away:
import midnight-lux

video 1280x720 30fps
theme midnight-lux

scene opener (4s) fade
  title "Bought. Imported. Mine." kinetic`,
  },
];
