// Pre-coded SceneLang v2 examples — explicit actions everywhere.

export interface Sample {
  id: string;
  title: string;
  tag: 'Aurora' | 'Swiss';
  description: string;
  code: string;
}

const T = (text: string) => `  title "${text}"
    fade in 0.55s
    rise 22 over 0.6s
    stagger words by 90ms`;
const TYPE = (text: string) => `  subtitle "${text}"
    type on over 1.4s`;

export const SAMPLES: Sample[] = [
  {
    id: 'product-ad',
    title: 'Product ad — 30s spot',
    tag: 'Aurora',
    description: 'A smooth premium ad: hook, features with growing bars, social proof, call to action.',
    code: `// A 30-second product spot — smooth & premium
video 1280x720 30fps
theme aurora

scene hook (4s)
  transition crossfade 0.85s
${T('Meet Halo.')}
${TYPE('water that thinks ahead')}

scene problem (4s)
  transition slide-left 0.7s
  title "Plastic is out."
    fade in 0.5s
    rise 18 over 0.55s
  text "Every year, 8 million tons of plastic reach the ocean. Your bottle shouldn't add to it."
    fade in 0.6s
    wait 250ms
    rise 12 over 0.5s

scene features (5s)
  transition crossfade 0.85s
${T('Smart. Cold. Forever.')}
  bars {Insulation:96, Weight:78, App Sync:85}
    grow over 0.9s
    stagger items by 110ms

scene proof (4.5s)
  transition crossfade 0.85s
  pie {5 star:78, 4 star:16, other:6}
    sweep over 1.1s
  subtitle "12,400 reviews and counting"
    fade in 0.5s
    rise 12 over 0.5s

scene cta (4s)
  transition zoom 0.8s
${T('Preorder today.')}
${TYPE('halo.example.com — ships March')}`,
  },
  {
    id: 'pitch-deck',
    title: 'Startup pitch deck',
    tag: 'Swiss',
    description: 'Clean Swiss-minimal investor deck: problem, market chart, traction, ask.',
    code: `// Investor pitch — Swiss minimal
video 1280x720 30fps
theme swiss

scene cover (3.5s)
  transition crossfade 0.85s
${T('Northwind')}
  subtitle "logistics, minus the chaos"
    fade in 0.5s
    rise 12 over 0.5s

scene problem (4s)
  transition slide-left 0.7s
  title "Freight is a black box."
    fade in 0.5s
  text "Shippers lose 18% of margin to delays they cannot see or predict."
    fade in 0.6s
    rise 10 over 0.5s

scene market (4.5s)
  transition crossfade 0.85s
  bars {2023:14, 2024:22, 2025:31, 2026:45}
    grow over 1s
    stagger items by 130ms
  subtitle "market size, \$B"
    fade in 0.5s

scene traction (4.5s)
  transition crossfade 0.85s
${T('We tripled, twice.')}
  bars {Q1:8, Q2:19, Q3:44, Q4:71}
    grow over 1s
    stagger items by 130ms

scene ask (4s)
  transition zoom 0.8s
${T('Raising \$2M seed.')}
  text "60% engineering · 25% growth · 15% ops"
    fade in 0.6s`,
  },
  {
    id: 'explainer',
    title: 'Explainer — how it works',
    tag: 'Aurora',
    description: 'Teach something in 20 seconds: three smooth steps and a wrap-up.',
    code: `// Explainer — smooth step-by-step
video 1280x720 30fps
theme aurora

scene intro (3.5s)
  transition crossfade 0.85s
${T('How coffee becomes code')}
${TYPE('a 3-step story')}

scene step-1 (4s)
  transition slide-left 0.7s
  title "1 · Brew"
    fade in 0.5s
    rise 16 over 0.5s
  text "Ideas start raw. Write them as simple scene lines — one line, one shot."
    fade in 0.6s

scene step-2 (4s)
  transition slide-left 0.7s
  title "2 · Render"
    fade in 0.5s
    rise 16 over 0.5s
  text "The converter turns every line into motion, timed to the millisecond."
    fade in 0.6s

scene step-3 (4s)
  transition slide-left 0.7s
  title "3 · Share"
    fade in 0.5s
    rise 16 over 0.5s
  text "Export a real video file and post it anywhere."
    fade in 0.6s

scene outro (3s)
  transition zoom 0.8s
${T('Simple as that.')}`,
  },
  {
    id: 'weekly-report',
    title: 'Data report — weekly metrics',
    tag: 'Swiss',
    description: 'Numbers that present themselves: KPI bars, share pie, one takeaway.',
    code: `// Weekly metrics — let the data talk
video 1280x720 30fps
theme swiss

scene kpis (5s)
  transition crossfade 0.85s
  title "Week 42"
    fade in 0.5s
    zoom from 96 to 100 over 0.6s
  bars {Signups:342, Active:289, Paid:96, Churn:11}
    grow over 1s
    stagger items by 120ms

scene split (4.5s)
  transition crossfade 0.85s
  pie {Mobile:58, Desktop:31, Tablet:11}
    sweep over 1.2s
  subtitle "where users watch"
    fade in 0.5s

scene takeaway (4s)
  transition zoom 0.8s
${T('Mobile is the main stage.')}
  text "Shift design reviews to phone-first previews next sprint."
    fade in 0.6s
    rise 10 over 0.5s`,
  },
  {
    id: 'event-invite',
    title: 'Event invite — 15s teaser',
    tag: 'Aurora',
    description: 'Short vertical teaser for a launch night: date, vibe, RSVP.',
    code: `// Event teaser — airy and elegant (vertical)
video 720x1280 30fps
theme aurora

scene save (3.5s)
  transition crossfade 0.85s
${T('Save the night.')}
${TYPE('nov 21 · downtown studio')}

scene line-up (4.5s)
  transition slide-left 0.7s
  bg gradient #fafafc -> #edeaf7
    pulse 5s
  title "One evening,"
    fade in 0.5s
    rise 16 over 0.5s
  text "live sets · demo corner · zero slides nobody reads"
    fade in 0.6s

scene rsvp (3.5s)
  transition zoom 0.8s
${T('RSVP now')}
${TYPE('link in bio — 80 seats')}`,
  },
  {
    id: 'recipe-shorts',
    title: 'Recipe short — vertical',
    tag: 'Aurora',
    description: '9:16 vertical short with three quick steps, made for phones.',
    code: `// Vertical recipe short (9:16)
video 720x1280 30fps
theme aurora

scene intro (3s)
  transition crossfade 0.85s
${T('3-step ramen')}
${TYPE('under 10 minutes')}

scene step-1 (3.5s)
  transition slide-left 0.6s
  title "Boil"
    fade in 0.45s
    rise 14 over 0.45s
  text "Broth + 700ml water, high heat."
    fade in 0.5s

scene step-2 (3.5s)
  transition slide-left 0.6s
  title "Build"
    fade in 0.45s
    rise 14 over 0.45s
  text "Noodles, egg, scallions — 4 minutes."
    fade in 0.5s

scene done (3s)
  transition zoom 0.8s
  title "Slurp."
    fade in 0.45s
    rise 18 over 0.5s
    stagger words by 120ms`,
  },
];

export function findSample(id: string): Sample | undefined {
  return SAMPLES.find((s) => s.id === id);
}
