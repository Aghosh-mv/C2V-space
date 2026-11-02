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
      'Export WebM for an instant video file, MP4 for universal playback.',
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
