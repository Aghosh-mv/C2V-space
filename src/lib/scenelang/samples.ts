// Pre-coded SceneLang examples — the remix gallery.

export interface Sample {
  id: string;
  title: string;
  tag: 'Aurora' | 'Swiss';
  description: string;
  code: string;
}

export const WELCOME_SAMPLE = `// Welcome to SceneLang — code that becomes video.
// Edit anything; the preview updates instantly.

video 1280x720 30fps
theme aurora

scene hello (4s) fade
  title "I write code." kinetic
  subtitle "and it becomes a video" typewriter

scene numbers (4.5s) fade-up
  title "Watch the data move" pop
  bars {Design:82, Speed:64, Fun:91} grow

scene share (3.5s) zoom-in
  pie {Aurora:55, Swiss:30, More:15} spin
  subtitle "two style packs" fade

scene bye (3s) fade
  title "Your turn." kinetic
  text "Edit this code, press play, export a real video file." fade-up
`;

export const SAMPLES: Sample[] = [
  {
    id: 'product-ad',
    title: 'Product ad — 30s spot',
    tag: 'Aurora',
    description: 'A smooth premium ad: hook, features with animated bars, social proof, call to action.',
    code: `// A 30-second product spot — smooth & premium
video 1280x720 30fps
theme aurora

scene hook (4s) fade
  title "Meet Halo." kinetic
  subtitle "water that thinks ahead" typewriter

scene problem (4s) fade-up
  title "Plastic is out." pop
  text "Every year, 8 million tons of plastic reach the ocean. Your bottle shouldn't add to it." fade

scene features (5s) slide-left
  title "Smart. Cold. Forever." kinetic
  bars {Insulation:96, Weight:78, App Sync:85} grow

scene proof (4.5s) fade
  pie {5 star:78, 4 star:16, other:6} spin
  subtitle "12,400 reviews and counting" fade-up

scene cta (4s) zoom-in
  title "Preorder today." kinetic
  subtitle "halo.example.com — ships March" typewriter
`,
  },
  {
    id: 'pitch-deck',
    title: 'Startup pitch deck',
    tag: 'Swiss',
    description: 'Clean Swiss-minimal investor deck: problem, market chart, traction, ask.',
    code: `// Investor pitch — Swiss minimal
video 1280x720 30fps
theme swiss

scene cover (3.5s) fade
  title "Northwind" pop
  subtitle "logistics, minus the chaos" fade-up

scene problem (4s) fade-up
  title "Freight is a black box." fade
  text "Shippers lose 18% of margin to delays they cannot see or predict." fade-up

scene market (4.5s) slide-left
  bars {2023:14, 2024:22, 2025:31, 2026:45} grow
  subtitle "market size, $B" fade

scene traction (4.5s) fade
  title "We tripled, twice." pop
  bars {Q1:8, Q2:19, Q3:44, Q4:71} grow

scene ask (4s) zoom-in
  title "Raising $2M seed." kinetic
  text "60% engineering · 25% growth · 15% ops" fade
`,
  },
  {
    id: 'explainer',
    title: 'Explainer — how it works',
    tag: 'Aurora',
    description: 'Teach something in 20 seconds: three smooth steps and a wrap-up.',
    code: `// Explainer — smooth step-by-step
video 1280x720 30fps
theme aurora

scene intro (3.5s) fade
  title "How coffee becomes code" kinetic
  subtitle "a 3-step story" typewriter

scene step-1 (4s) slide-left
  title "1 · Brew" pop
  text "Ideas start raw. Write them as simple scene lines — one line, one shot." fade

scene step-2 (4s) slide-left
  title "2 · Render" pop
  text "The converter turns every line into motion, timed to the millisecond." fade

scene step-3 (4s) slide-left
  title "3 · Share" pop
  text "Export a real video file and post it anywhere. That's the whole trick." fade

scene outro (3s) zoom-in
  title "Simple as that." kinetic
`,
  },
  {
    id: 'weekly-report',
    title: 'Data report — weekly metrics',
    tag: 'Swiss',
    description: 'Numbers that present themselves: KPI bars, share pie, one takeaway.',
    code: `// Weekly metrics — let the data talk
video 1280x720 30fps
theme swiss

scene kpis (5s) fade-up
  title "Week 42" pop
  bars {Signups:342, Active:289, Paid:96, Churn:11} grow

scene split (4.5s) fade
  pie {Mobile:58, Desktop:31, Tablet:11} spin
  subtitle "where users watch" fade

scene takeaway (4s) zoom-in
  title "Mobile is the main stage." kinetic
  text "Shift design reviews to phone-first previews next sprint." fade
`,
  },
  {
    id: 'event-invite',
    title: 'Event invite — 15s teaser',
    tag: 'Aurora',
    description: 'Short teaser for a launch night: date, vibe, RSVP.',
    code: `// Event teaser — airy and elegant
video 720x1280 30fps
theme aurora

scene save (3.5s) fade
  title "Save the night." kinetic
  subtitle "nov 21 · downtown studio" typewriter

scene line-up (4.5s) slide-left
  title "One evening," pop
  text "live sets · demo corner · zero slides nobody reads" fade

scene rsvp (3.5s) zoom-in
  title "RSVP now" kinetic
  subtitle "link in bio — 80 seats" typewriter
`,
  },
  {
    id: 'recipe-shorts',
    title: 'Recipe short — vertical',
    tag: 'Aurora',
    description: '9:16 vertical short with three quick steps, made for phones.',
    code: `// Vertical recipe short (9:16)
video 720x1280 30fps
theme aurora

scene intro (3s) fade
  title "3-step ramen" kinetic
  subtitle "under 10 minutes" typewriter

scene step-1 (3.5s) slide-left
  title "Boil" pop
  text "Broth + 700ml water, high heat." fade

scene step-2 (3.5s) slide-left
  title "Build" pop
  text "Noodles, egg, scallions — 4 minutes." fade

scene done (3s) zoom-in
  title "Slurp." kinetic
`,
  },
];

export function findSample(id: string): Sample | undefined {
  return SAMPLES.find((s) => s.id === id);
}
