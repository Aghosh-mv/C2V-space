// The effect shelf — premade action packs, free to everyone. Each pack is a
// real SceneLang scene built from explicit actions (with ease & delay knobs)
// that appends straight into your video, so you can read, keep or remix it.

export interface CatalogEffect {
  id: string;
  title: string;
  author: string;
  description: string;
  code: string;
}

const E = (
  id: string,
  title: string,
  description: string,
  code: string,
): CatalogEffect => ({ id: `cat-fx-${id}`, title, author: 'SceneLang', description, code });

export const CATALOG_EFFECTS: CatalogEffect[] = [
  E('kinetic-title', 'Kinetic title — the classic',
    'Words land one by one, each fading and rising with its own eased motion.',
    `scene kinetic-title (4s)
  transition crossfade 0.85s
  title "Ideas that land"
    fade in 0.5s ease out
    rise 24 over 0.6s ease out
    stagger words by 110ms ease out`),
  E('typewriter', 'Typewriter intro',
    'A title appears, then the subtitle is typed on with a blinking caret.',
    `scene typewriter-intro (5s)
  transition crossfade 0.85s
  title "Chapter One"
    fade in 0.5s ease out
    rise 16 over 0.5s ease out
  subtitle "it began with a single line of code"
    type on over 2.2s ease linear`),
  E('spell-out', 'Letter spell-out',
    'Letters of the title arrive one by one, 40ms apart.',
    `scene spell-out (4s)
  transition crossfade 0.85s
  title "MOMENTUM"
    fade in 0.4s ease out
    stagger letters by 60ms ease out`),
  E('push-in', 'Cinematic push-in',
    'A slow eased zoom that pulls the viewer toward the subject.',
    `scene push-in (6s)
  transition crossfade 1.2s
  image https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200
    fade in 0.8s ease out
    zoom from 100 to 114 over 6s ease in-out
  title "Closer than ever"
    fade in 1s ease out delay 600ms
    rise 18 over 1s ease out`),
  E('ken-burns', 'Ken Burns drift',
    'Push in and drift sideways at the same time — the documentary pair.',
    `scene ken-burns (7s)
  transition crossfade 1.2s
  image https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200
    fade in 0.8s ease out
    zoom from 102 to 112 over 7s ease linear
    drift right 36 over 7s ease linear
  subtitle "shot on code"
    fade in 1.2s ease out delay 1s`),
  E('settle-cascade', 'Settle cascade',
    'Three stacked moves: fade, drop and a late body line with a delay knob.',
    `scene settle-cascade (5s)
  transition slide-left 0.7s
  title "Everything settles."
    fade in 0.45s ease out
    drop 20 over 0.7s ease out
    stagger words by 90ms
  text "motion with manners — nothing snaps"
    fade in 0.5s ease out delay 700ms
    rise 12 over 0.6s ease out`),
  E('swipe-reveal', 'Swipe reveal',
    'A horizontal slide with a hard ease-in that softens as it lands.',
    `scene swipe-reveal (4s)
  transition cut
  title "Swiped in."
    fade in 0.3s ease out
    slide left 90 over 0.8s ease in-out
    stagger words by 70ms
  subtitle "cut, then glide"
    fade in 0.4s ease out delay 500ms`),
  E('scale-announce', 'Scale announcement',
    'A gentle scale-up from 94% with an eased overshoot feel.',
    `scene scale-announce (4.5s)
  transition zoom 0.9s
  title "Big news."
    fade in 0.4s ease out
    zoom from 94 to 100 over 0.9s ease out
    stagger words by 120ms`),
  E('breathing-bg', 'Breathing background',
    'The aurora wash pulses slowly behind a still title.',
    `scene breathing-bg (6s)
  transition crossfade 1s
  bg gradient #fafafc -> #edeaf7
    pulse 5s
  title "Breathe."
    fade in 1.2s ease out
    rise 14 over 1.6s ease in-out`),
  E('chart-hero', 'Chart hero reveal',
    'Bars grow with per-item stagger, then the takeaway arrives late.',
    `scene chart-hero (6s)
  transition crossfade 0.85s
  bars {Reach:88, Trust:74, Sales:92}
    grow over 1.1s ease out
    stagger items by 150ms ease out
  subtitle "the quarter, honestly"
    fade in 0.5s ease out delay 1400ms
    rise 10 over 0.5s ease out`),
  E('pie-story', 'Pie story',
    'A sweeping donut, legend staggering in, note fading up last.',
    `scene pie-story (6s)
  transition crossfade 0.85s
  pie {Word of mouth:46, Ads:31, Partners:23}
    sweep over 1.3s ease in-out
    stagger items by 120ms
  text "where new users come from"
    fade in 0.6s ease out delay 1600ms`),
  E('sprite-hello', 'Sprite hello',
    'Your character fades, rises, then idles with an endless bob.',
    `scene sprite-hello (6s)
  transition crossfade 0.85s
  sprite hero.png
    fade in 0.6s ease out
    rise 26 over 0.9s ease out
    bob 8 over 2.2s ease linear
  title "Say hi to Bit."
    fade in 0.5s ease out delay 800ms
    stagger words by 100ms`),
  E('dialogue-card', 'Dialogue card',
    'An imported .txt paced across the scene as speaker cards.',
    `scene dialogue-card (8s)
  transition crossfade 0.85s
  lines dialogue.txt
    fade in 0.5s ease out
  title "Scene 14 — the array"
    fade in 0.5s ease out
    rise 14 over 0.6s ease out`),
  E('countdown-tense', 'Countdown tension',
    'Wait knobs build tension; each word lands heavier than the last.',
    `scene countdown-tense (5s)
  transition cut
  title "Three. Two. One."
    fade in 0.3s ease in
    stagger words by 800ms ease in
    rise 10 over 0.4s ease out
  subtitle "go"
    fade in 0.2s ease out delay 2600ms`),
  E('exit-graceful', 'Graceful exit',
    'Everything arrives, holds, then fades out together before the cut.',
    `scene exit-graceful (5s)
  transition crossfade 0.85s
  title "Hold the moment."
    fade in 0.5s ease out
    rise 20 over 0.6s ease out
    stagger words by 90ms
    fade out 0.7s ease in`),
  E('slow-sermon', 'Slow sermon',
    'A long, quiet scene: 1.5s fades, 2s rises, 300ms word gaps.',
    `scene slow-sermon (10s)
  transition crossfade 1.5s
  title "Some things deserve slowness."
    fade in 1.5s ease out
    rise 22 over 2s ease in-out
    stagger words by 300ms ease out
  subtitle "ten unhurried seconds"
    fade in 2s ease out delay 2.5s`),
  E('grid-blueprint', 'Grid blueprint',
    'Graph paper, a pulsing ring, and a title that rises into place.',
    `scene grid-blueprint (6s)
  transition crossfade 0.9s
  bg grid
  shape ring
    pulse 4s
    spin 360 over 14s ease linear
  title "The plan."
    fade in 0.6s ease out
    rise 18 over 0.8s ease out`),
  E('orbit', 'Orbit feel',
    'Two rings spinning at different speeds create an orbital illusion.',
    `scene orbit (7s)
  transition crossfade 1s
  shape ring
    spin 360 over 9s ease linear
    pulse 5s
  shape ring
    spin -360 over 13s ease linear
  title "Keep things moving."
    fade in 0.8s ease out
    rise 16 over 1s ease out`),
  E('gym-intro', 'Ease-in drop intro',
    'An ease-in fall that lands with weight, then a confident rise.',
    `scene gym-intro (5s)
  transition crossfade 0.7s
  title "Day one."
    fade in 0.35s ease out
    drop 34 over 0.7s ease in
    stagger words by 140ms
  subtitle "no shortcuts, just reps"
    fade in 0.5s ease out delay 900ms
    rise 12 over 0.5s ease out`),
  E('whisper-quote', 'Whisper quote',
    'A quote that fades in almost secretly, letters spaced wide.',
    `scene whisper-quote (7s)
  transition crossfade 1.2s
  bg gradient #fdfcf9 -> #f5f1e8
    pulse 7s
  title "'Make it quiet, make it count.'"
    fade in 2s ease out
    rise 10 over 2.4s ease in-out
    stagger words by 260ms ease out`),
  E('editorial-slide', 'Editorial slide pair',
    'Title slides in from the left while the subtitle rises from below.',
    `scene editorial-slide (5s)
  transition slide-right 0.8s
  title "The April issue"
    fade in 0.4s ease out
    slide right 70 over 0.9s ease in-out
  subtitle "on craft, patience and code"
    fade in 0.5s ease out delay 400ms
    rise 14 over 0.6s ease out`),
  E('data-drip', 'Data drip',
    'Bars wait their turn, then grow one after another with hard eases.',
    `scene data-drip (7s)
  transition crossfade 0.85s
  bars {Jan:22, Feb:35, Mar:51, Apr:78}
    wait 400ms
    grow over 0.8s ease in-out
    stagger items by 400ms ease out
  subtitle "compounding, month by month"
    fade in 0.5s ease out delay 2400ms`),
  E('frame-zoom', 'Frame zoom out',
    'Starts tight at 118% and eases out to frame the whole shot.',
    `scene frame-zoom (6s)
  transition crossfade 1s
  image https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200
    fade in 0.7s ease out
    zoom from 118 to 100 over 6s ease in-out
  title "The wider view"
    fade in 1s ease out delay 1200ms
    rise 16 over 1.2s ease out`),
  E('vignette-drift', 'Night drift',
    'A dark stage, drifting light, a title that glows softly into place.',
    `scene night-drift (8s)
  transition crossfade 1.4s
  bg solid #101014
    drift up 18 over 8s ease linear
  shape circle
    pulse 6s
  title "After hours"
    fade in 1.6s ease out
    rise 20 over 2.2s ease in-out
    stagger words by 340ms ease out`),
];
