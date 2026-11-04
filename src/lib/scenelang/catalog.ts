// The premade catalog — 60+ StyleKit styles and 220+ SceneLang templates.
// Nothing here is installed by default: browse, choose, then import or remix.
// All code is generated deterministically in SceneLang v2 (explicit actions).

export interface CatalogStyle {
  id: string;
  name: string;
  title: string;
  author: string;
  price: number;
  description: string;
  code: string;
}

export interface CatalogTemplate {
  id: string;
  title: string;
  author: string;
  price: number;
  description: string;
  code: string;
}

/* ------------------------------ styles -------------------------------- */

// [bg0, bg1, ink, accent1, accent2, accent3, name, font, tracking, vignette, orbs]
type StyleRow = [string, string, string, string, string, string, string, 'sans' | 'serif', number, number, number];

const STYLE_ROWS: StyleRow[] = [
  ['#fafafc', '#edeaf7', '#16161d', '#7c6cf0', '#2bb59a', '#f2925c', 'aurora', 'sans', 1, 0.08, 7],
  ['#ffffff', '#efefeb', '#111111', '#e63946', '#8d8d86', '#c9c9c3', 'swiss', 'sans', 0, 0, 0],
  ['#0e0e16', '#1a1a2e', '#f5f3ff', '#c4b5fd', '#7dd3c8', '#f7c59f', 'midnight-lux', 'sans', 1.5, 0.25, 9],
  ['#faf6f0', '#f3e7d8', '#3d2f23', '#b5654a', '#8a9a5b', '#d9b08c', 'sandstone', 'serif', 0.5, 0.1, 4],
  ['#fdf7fa', '#f2e8f7', '#40243a', '#b76e9b', '#7c6cf0', '#e8b4d8', 'orchid', 'serif', 1, 0.09, 6],
  ['#f7faf5', '#e8f1e4', '#1f3325', '#4a7c59', '#a3c9a8', '#d4a373', 'matcha', 'sans', 0.5, 0.08, 5],
  ['#101012', '#1d1c1a', '#f6f1e7', '#d4af37', '#f6f1e7', '#9c8244', 'noir-gold', 'serif', 2, 0.3, 8],
  ['#fdfcf9', '#f5f1e8', '#2b2b28', '#a68a64', '#6b705c', '#cb997e', 'linen', 'serif', 0.5, 0.07, 3],
  ['#fbf3ee', '#f4dfd2', '#4a2c1a', '#c96f4a', '#7a9e7e', '#e6b89c', 'terracotta', 'sans', 0.5, 0.1, 5],
  ['#f4f7f4', '#e2ece2', '#22332a', '#5b8a72', '#a4c3b2', '#cfe1d4', 'sage', 'sans', 0.8, 0.08, 4],
  ['#f9f5f2', '#efe4e0', '#31261f', '#b07d62', '#8c6a5d', '#d9c1b0', 'cocoa', 'serif', 0.6, 0.1, 4],
  ['#fcfbf7', '#eef0e9', '#20241c', '#7d8f69', '#b5c99a', '#e2d4ba', 'moss', 'sans', 0.5, 0.07, 4],
  ['#ffffff', '#f2f2f0', '#141414', '#141414', '#b76e79', '#9a8c98', 'porcelain', 'sans', 1.2, 0.05, 2],
  ['#f6f4f1', '#e8e4dd', '#2c2a26', '#8a817c', '#463f3a', '#c8b8a6', 'stone', 'sans', 0.4, 0.08, 3],
  ['#fdf8f2', '#f7e8d4', '#3f3226', '#d08c60', '#997b66', '#e8c9a0', 'honey', 'serif', 0.8, 0.09, 5],
  ['#f5f8fa', '#e4edf2', '#1d2d36', '#3d6b7d', '#84a9ac', '#cae0e6', 'sea-glass', 'sans', 0.8, 0.08, 6],
  ['#faf5f7', '#f0e4ee', '#2f1e2e', '#9d6b9d', '#c9a7c7', '#e5d0e2', 'velvet-plum', 'serif', 1, 0.1, 6],
  ['#fbf7ef', '#f1e9d8', '#33301f', '#a98467', '#adc178', '#dde5b6', 'olive-press', 'sans', 0.5, 0.08, 4],
  ['#fffdf8', '#f4ede2', '#2d2a24', '#bc6c25', '#606c38', '#dda15e', 'harvest', 'serif', 0.6, 0.09, 5],
  ['#f8fafb', '#e8eef1', '#1b2733', '#457b9d', '#a8dadc', '#f1faee', 'fog', 'sans', 0.7, 0.07, 5],
  ['#fdf5f3', '#f7e3de', '#38221d', '#c1543f', '#e5989b', '#ffb4a2', 'blush', 'serif', 0.8, 0.08, 5],
  ['#f7f6f2', '#eceae2', '#26251f', '#6c6f5d', '#a4ac86', '#d6d3c4', 'paper-cut', 'sans', 0.3, 0.06, 2],
  ['#fafafa', '#f0f0f5', '#191922', '#5c5470', '#8d86a8', '#c5bfda', 'dusk', 'sans', 1, 0.09, 6],
  ['#fff9f5', '#ffeede', '#33261c', '#e07a5f', '#f2cc8f', '#81b29a', 'cream-soda', 'sans', 0.5, 0.07, 6],
  ['#f4f6f5', '#e6ebe9', '#20302b', '#2f6d5e', '#79b4a4', '#bcd8cf', 'forest-mist', 'serif', 0.7, 0.09, 5],
  ['#fcfcfd', '#eceef4', '#171a2b', '#4a4e8f', '#8f93c5', '#c9cce4', 'lagoon', 'sans', 0.9, 0.08, 6],
  ['#fffdfb', '#f9efe7', '#2c211a', '#a4491f', '#d0a079', '#e8cdb4', 'amber-frost', 'serif', 0.9, 0.09, 5],
  ['#f9f9f7', '#ededea', '#1f1f1d', '#6b705c', '#a5a58d', '#cbcbba', 'ivory-ink', 'sans', 0.6, 0.06, 3],
  ['#f8f3fa', '#eadfef', '#332440', '#6d3b7e', '#a578b3', '#d4bce2', 'heather', 'sans', 0.8, 0.09, 5],
  ['#fbfaf7', '#f0ede4', '#2a2a24', '#936639', '#7f91a2', '#d5cdb9', 'walnut', 'serif', 0.5, 0.09, 4],
  ['#f5f9f8', '#e2eeec', '#1e2f2d', '#2a9d8f', '#8ecac3', '#cfe8e4', 'eucalyptus', 'sans', 0.7, 0.08, 5],
  ['#fdf6f9', '#f6e6ee', '#37222e', '#b23a48', '#d98ba3', '#f0cbd9', 'rosewood', 'serif', 1, 0.1, 5],
  ['#f7f8f6', '#e9ece5', '#23281f', '#586f47', '#93a878', '#cdd6bf', 'fern', 'sans', 0.4, 0.07, 4],
  ['#fbf8f4', '#f2ebdf', '#2e2a22', '#8c7853', '#b0a47e', '#ddd2ba', 'wheat', 'serif', 0.6, 0.08, 4],
  ['#fafafa', '#ececec', '#111111', '#111111', '#e63946', '#a8a8a8', 'ink-red', 'sans', 0, 0.05, 0],
  ['#f6f7fb', '#e6e9f4', '#1c2033', '#3a3f6d', '#7d84b2', '#c0c4de', 'periwinkle', 'sans', 0.8, 0.08, 5],
  ['#fff8f0', '#ffe9d6', '#3d2b1f', '#d95d39', '#f0a202', '#202a25', 'marmalade', 'sans', 0.5, 0.08, 6],
  ['#f4f4ef', '#e4e6db', '#25281e', '#6a7052', '#98a47d', '#c8cdb4', 'matcha-latte', 'serif', 0.6, 0.08, 4],
  ['#faf7f2', '#efe7dc', '#2f2a24', '#7f6a93', '#b7a6c9', '#ded3ea', 'lavender-grey', 'sans', 0.8, 0.08, 5],
  ['#0f1218', '#1c2431', '#eef2f7', '#8ecae6', '#ffd166', '#f4f7fa', 'nordic-night', 'sans', 1.2, 0.22, 7],
  ['#fdfbf7', '#f3ede1', '#292521', '#c08552', '#6f7d64', '#e3d5c3', 'oat', 'serif', 0.5, 0.08, 3],
  ['#f8f5fa', '#ebe3f2', '#2b2140', '#5e4b8b', '#9d8ec7', '#d3c8ea', 'wisteria', 'sans', 0.9, 0.09, 6],
  ['#f9fbf9', '#e9f2ea', '#1d2b20', '#3c7a57', '#8fbf9f', '#cfe6d6', 'juniper', 'sans', 0.6, 0.08, 5],
  ['#fffef9', '#f8f2e2', '#333227', '#b58e3e', '#8a9a5b', '#e6d3a3', 'chamomile', 'serif', 0.7, 0.08, 4],
  ['#f7f5f8', '#e9e4ee', '#25202b', '#43364a', '#7d6b85', '#c0b2c9', 'smoked-plum', 'serif', 0.8, 0.1, 4],
  ['#fbf6f0', '#f3e4d7', '#33241a', '#b3572d', '#d99873', '#ecc9ae', 'apricot', 'sans', 0.5, 0.08, 5],
  ['#f5f7f7', '#e7ecec', '#1f2a2a', '#33646a', '#7ba7ab', '#c6dcde', 'harbor', 'sans', 0.7, 0.08, 5],
  ['#fdfcfa', '#f1f0ea', '#22201b', '#8d6b4b', '#5f7050', '#d8d2c2', 'cedar', 'serif', 0.5, 0.08, 4],
  ['#f9f4f4', '#eddfe3', '#302226', '#8f5d6e', '#c39aa7', '#e5c9d1', 'petal', 'serif', 0.9, 0.09, 5],
  ['#fafaf6', '#ededf0', '#1a1a20', '#494959', '#8b8ba0', '#c9c9d6', 'graphite', 'sans', 0.6, 0.06, 2],
  ['#fff6ec', '#ffe3c4', '#402e1d', '#e36414', '#fb8b24', '#5f0f40', 'sunset-spice', 'sans', 0.6, 0.1, 6],
  ['#f6f9f8', '#e3efec', '#1c2b27', '#35726b', '#7fb3a8', '#c4ded7', 'mint-clay', 'serif', 0.6, 0.08, 4],
  ['#fbf9fa', '#f0e9ee', '#2a2230', '#7c5c8a', '#ab8fb9', '#d9c8e4', 'mauve-hour', 'sans', 0.8, 0.09, 5],
  ['#f7f9fa', '#e9eff2', '#1e2c34', '#2f6690', '#93b5c6', '#d0dfeb', 'arctic', 'sans', 0.7, 0.07, 5],
  ['#fdf9f5', '#f5e9dd', '#2e241d', '#9c6644', '#c8956f', '#edd8c3', 'camel', 'serif', 0.6, 0.09, 4],
  ['#f8faf6', '#e9f0e2', '#22301c', '#5c7a3f', '#98b06f', '#d2e0bc', 'spring-pea', 'sans', 0.5, 0.07, 5],
  ['#fbf7f5', '#f1e5e0', '#312019', '#a44a3f', '#d69a8c', '#ecc9bf', 'coral-clay', 'serif', 0.7, 0.09, 4],
  ['#fafaf9', '#eeeeec', '#14141a', '#27272e', '#73738c', '#b9b9cc', 'pearl-slate', 'sans', 0.8, 0.05, 2],
  ['#fffdf6', '#f9f0d7', '#2f2a18', '#c9a227', '#87805e', '#e8d98a', 'sunbeam', 'serif', 0.7, 0.08, 5],
  ['#f6f4f9', '#e7e2f0', '#231d33', '#4b3f72', '#8377ad', '#c3bae0', 'amethyst', 'sans', 0.9, 0.09, 6],
  ['#f9f7f2', '#ece6d8', '#282620', '#6b5b4e', '#96897b', '#d1c7b8', 'driftwood', 'serif', 0.5, 0.08, 3],
  ['#f8f6f3', '#e9e2da', '#2b2620', '#a05e2c', '#677565', '#dccdbb', 'dune', 'sans', 0.6, 0.08, 4],
];

function rgbaFrom(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export const CATALOG_STYLES: CatalogStyle[] = STYLE_ROWS.map(
  ([bg0, bg1, ink, a1, a2, a3, name, font, tracking, vignette, orbs], i) => ({
    id: `cat-style-${name}`,
    name,
    title: name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    author: ['atelier', 'velvet', 'clay.co', 'leafstudio', 'petal', 'northform'][i % 6],
    price: i < 2 ? 0 : [0, 0, 2, 3, 0, 4, 1, 0, 2][i % 9],
    description: [
      'A hand-tuned look: soft light, calm palette, premium motion.',
      'Quiet luxury — built for keynotes and slow, confident ads.',
      'Editorial mood with a smooth, swift feel. No neon, ever.',
      'Warm and cinematic. Pairs well with product stories.',
      'Clean paper energy with one confident accent.',
    ][i % 5],
    code: `style ${name}\nbg ${bg0} -> ${bg1}\nink ${ink}\ndim ${rgbaFrom(ink, 0.62)}\naccents ${a1}, ${a2}, ${ink}, ${a3}\nfont ${font}\ntracking ${tracking}\nvignette ${vignette}\norbs ${orbs}`,
  }),
);

export const CATALOG_STYLE_NAMES = CATALOG_STYLES.map((s) => s.name);

/* ----------------------------- templates ------------------------------ */

interface Topic {
  key: string;
  brand: string;
  product: string;
  tagline: string;
  hook: string;
  problem: string;
  features: [string, string, string];
  stats: [number, number, number];
  statUnit: string;
  pie: [string, string, string];
  pieValues: [number, number, number];
  pieNote: string;
  steps: [string, string, string];
  cta: string;
  ctaSub: string;
  body: string;
}

const TOPICS: Topic[] = [
  {
    key: 'coffee', brand: 'CloudSip', product: 'cloud foam latte', tagline: 'coffee that floats',
    hook: 'Your cup, lighter.', problem: 'Heavy syrups hide the bean. Ours lets it speak.',
    features: ['Foam', 'Body', 'Aroma'], stats: [92, 78, 88], statUnit: 'taste score',
    pie: ['Oat', 'Whole', 'Black'], pieValues: [48, 34, 18], pieNote: 'how our regulars take it',
    steps: ['Brew slow', 'Whip the cloud', 'Pour gentle'], cta: 'First cup on us.', ctaSub: 'cloudsip.example.com',
    body: 'Single-origin beans, whipped to a silk that sits above the roast.',
  },
  {
    key: 'sneaker', brand: 'Jump Velo', product: 'Velo One runner', tagline: 'built to disappear',
    hook: 'Run lighter.', problem: 'Training shoes fight your stride at kilometer six.',
    features: ['Weight', 'Return', 'Grip'], stats: [96, 90, 84], statUnit: 'lab index',
    pie: ['Road', 'Track', 'Trail'], pieValues: [55, 27, 18], pieNote: 'where runners wear theirs',
    steps: ['Lace up', 'Find rhythm', 'Forget them'], cta: 'Drop lands Friday.', ctaSub: 'jumpvelo.example.com',
    body: 'A knitted upper that breathes, a plate that springs, 212 grams total.',
  },
  {
    key: 'skincare', brand: 'Dew Studio', product: 'morning dew serum', tagline: 'glow, quietly',
    hook: 'Skin first. Filters never.', problem: 'Ten-step routines tire more than they treat.',
    features: ['Hydration', 'Calm', 'Glow'], stats: [89, 82, 94], statUnit: 'panel score',
    pie: ['Morning', 'Night', 'Both'], pieValues: [31, 22, 47], pieNote: 'when users apply it',
    steps: ['Cleanse', 'Three drops', 'Press in'], cta: 'Start the ritual.', ctaSub: 'dewstudio.example.com',
    body: 'Three ingredients you can pronounce, one result you can photograph.',
  },
  {
    key: 'gadget', brand: 'Pulse', product: 'Pulse Buds 2', tagline: 'silence, on demand',
    hook: 'Press. Hush.', problem: 'Noise cancels your focus, not just the traffic.',
    features: ['Cancel', 'Clarity', 'Battery'], stats: [93, 87, 90], statUnit: 'review score',
    pie: ['Commute', 'Office', 'Gym'], pieValues: [42, 33, 25], pieNote: 'where they get worn',
    steps: ['Pair once', 'Tap twice', 'Tune out'], cta: 'Preorder opens today.', ctaSub: 'pulse.example.com',
    body: 'Adaptive hush that reads the room and keeps the podcast crystal.',
  },
  {
    key: 'bakery', brand: 'Crumb & Co', product: 'sourdough loaves', tagline: 'bread worth waiting for',
    hook: 'Baked at 4am.', problem: 'Supermarket loaves forgot what crust means.',
    features: ['Crust', 'Crumb', 'Tang'], stats: [95, 88, 79], statUnit: 'lovers agree',
    pie: ['Sourdough', 'Rye', 'Baguette'], pieValues: [52, 26, 22], pieNote: 'the morning mix',
    steps: ['Feed starter', 'Fold gently', 'Bake hot'], cta: 'Reserve tomorrow\'s loaf.', ctaSub: 'crumbco.example.com',
    body: 'Forty-eight hours of patience, ninety seconds of steam, one perfect crackle.',
  },
  {
    key: 'gym', brand: 'Ironwood', product: 'strength program', tagline: 'strong is a skill',
    hook: 'Twelve weeks. New you.', problem: 'Random workouts build random results.',
    features: ['Plan', 'Form', 'Progress'], stats: [90, 86, 91], statUnit: 'member gains',
    pie: ['Morning', 'Lunch', 'Evening'], pieValues: [38, 27, 35], pieNote: 'favorite session slots',
    steps: ['Assess', 'Lift', 'Track'], cta: 'First week free.', ctaSub: 'ironwood.example.com',
    body: 'A program that adapts to your week, your bar, and your bad days.',
  },
  {
    key: 'travel', brand: 'Wander', product: 'slow travel trips', tagline: 'go far, stay long',
    hook: 'Ten days. One valley.', problem: 'Checklists make trips feel like chores.',
    features: ['Stay', 'Food', 'Routes'], stats: [94, 91, 87], statUnit: 'traveler joy',
    pie: ['Mountains', 'Coast', 'Cities'], pieValues: [44, 39, 17], pieNote: 'where wanderers go',
    steps: ['Pick a valley', 'Stay local', 'Walk everywhere'], cta: 'Autumn trips open.', ctaSub: 'wander.example.com',
    body: 'Small groups, long stays, and mornings that belong to nobody.',
  },
  {
    key: 'photo', brand: 'Aperture', product: 'portrait sessions', tagline: 'light does the talking',
    hook: 'One hour. Forever.', problem: 'Stiff studios make stiff portraits.',
    features: ['Light', 'Ease', 'Retouch'], stats: [92, 96, 85], statUnit: 'client love',
    pie: ['Studio', 'Golden hour', 'Home'], pieValues: [24, 58, 18], pieNote: 'favorite light',
    steps: ['Book a slot', 'Walk & talk', 'Pick your frames'], cta: 'Spring sessions open.', ctaSub: 'aperture.example.com',
    body: 'We chase the last hour of sun and let you forget the camera.',
  },
  {
    key: 'books', brand: 'Inkwell', product: 'spring list', tagline: 'books with spine',
    hook: 'Five debuts. One shelf.', problem: 'Bestseller lists all look the same.',
    features: ['Voice', 'Print', 'Design'], stats: [88, 93, 90], statUnit: 'reader score',
    pie: ['Fiction', 'Essays', 'Poetry'], pieValues: [47, 33, 20], pieNote: 'this season\'s mix',
    steps: ['Meet the authors', 'Read a chapter', 'Order the set'], cta: 'The list ships May 1.', ctaSub: 'inkwell.example.com',
    body: 'Independent press energy: cloth covers, sewn bindings, sharp sentences.',
  },
  {
    key: 'plants', brand: 'Leaf & Pot', product: 'desk jungles', tagline: 'green that survives you',
    hook: 'Meet your easiest plant.', problem: 'Every desk deserves life, even yours.',
    features: ['Hardiness', 'Light needs', 'Size'], stats: [97, 84, 89], statUnit: 'still thriving',
    pie: ['Pothos', 'Snake', 'ZZ'], pieValues: [41, 35, 24], pieNote: 'the unkillable trio',
    steps: ['Pick a pot', 'Water weekly-ish', 'Watch it climb'], cta: 'Starter jungle — $29.', ctaSub: 'leafandpot.example.com',
    body: 'Three plants, one delivery, a lifetime of asking — is that new growth?',
  },
  {
    key: 'music', brand: 'Nova Records', product: 'midnight EP', tagline: 'for the quiet hours',
    hook: 'Out now: Midnight.', problem: 'Playlists blur. This one doesn\'t.',
    features: ['Mix', 'Master', 'Artwork'], stats: [91, 95, 88], statUnit: 'press score',
    pie: ['Vinyl', 'Streaming', 'Cassette'], pieValues: [46, 38, 16], pieNote: 'how fans listen',
    steps: ['Press play', 'Dim the lights', 'Play it again'], cta: 'Listen tonight.', ctaSub: 'novarecords.example.com',
    body: 'Six tracks recorded in one take on a four-track, exactly as written.',
  },
];

const H = 'video 1280x720 30fps';
const V = 'video 720x1280 30fps';

const title = (t: string, extra = '') => `  title "${t}"\n    fade in 0.55s\n    rise 22 over 0.6s${extra}`;
const stagger = (by = 90) => `    stagger words by ${by}ms`;
const sub = (t: string) => `  subtitle "${t}"\n    fade in 0.6s`;
const typed = (t: string) => `  subtitle "${t}"\n    type on over 1.4s`;
const body = (t: string) => `  text "${t}"\n    fade in 0.6s\n    rise 14 over 0.6s`;
const bars = (t: Topic, unit: string) =>
  `  bars {${t.features[0]}:${t.stats[0]}, ${t.features[1]}:${t.stats[1]}, ${t.features[2]}:${t.stats[2]}}\n    grow over 0.9s\n    stagger items by 110ms\n  subtitle "${unit}"\n    fade in 0.6s`;
const pie = (t: Topic) =>
  `  pie {${t.pie[0]}:${t.pieValues[0]}, ${t.pie[1]}:${t.pieValues[1]}, ${t.pie[2]}:${t.pieValues[2]}}\n    sweep over 1.1s\n  subtitle "${t.pieNote}"\n    fade in 0.5s`;

type Builder = (t: Topic, theme: string) => string;

const BUILDERS: { id: string; label: string; vertical?: boolean; build: Builder }[] = [
  {
    id: 'product-ad', label: 'Product ad', build: (t, th) => `${H}\ntheme ${th}\n\nscene hook (4s)\n  transition crossfade 0.85s\n${title(t.hook)}\n${stagger()}\n${typed(t.tagline)}\n\nscene problem (4s)\n  transition slide-left 0.7s\n${title('The old way.')}\n${body(t.problem)}\n\nscene features (5s)\n  transition crossfade 0.85s\n${title('Why ' + t.brand + '.')}\n${bars(t, t.statUnit)}\n\nscene proof (4.5s)\n  transition crossfade 0.85s\n${pie(t)}\n\nscene cta (4s)\n  transition zoom 0.8s\n${title(t.cta)}\n${stagger()}\n${typed(t.ctaSub)}`,
  },
  {
    id: 'pitch-deck', label: 'Investor pitch', build: (t, th) => `${H}\ntheme ${th}\n\nscene cover (3.5s)\n  transition crossfade 0.85s\n${title(t.brand)}\n${stagger(110)}\n${sub(t.tagline)}\n\nscene problem (4s)\n  transition slide-left 0.7s\n${title('The problem.')}\n${body(t.problem)}\n\nscene market (5s)\n  transition crossfade 0.85s\n${bars(t, t.statUnit + ' · market signal')}\n\nscene product (4s)\n  transition crossfade 0.85s\n${title(t.product)}\n${typed(t.body.slice(0, 46))}\n\nscene ask (4s)\n  transition zoom 0.8s\n${title('Join us.')}\n${body('60% product · 25% growth · 15% ops')}`,
  },
  {
    id: 'explainer', label: 'Explainer', build: (t, th) => `${H}\ntheme ${th}\n\nscene intro (3.5s)\n  transition crossfade 0.85s\n${title('How it works.')}\n${stagger()}\n${typed('three small steps')}\n\nscene step-1 (4s)\n  transition slide-left 0.7s\n${title('1 · ' + t.steps[0])}\n${body(t.body)}\n\nscene step-2 (4s)\n  transition slide-left 0.7s\n${title('2 · ' + t.steps[1])}\n${body('It takes seconds and no manuals.')}\n\nscene step-3 (4s)\n  transition slide-left 0.7s\n${title('3 · ' + t.steps[2])}\n${body('And that is the whole trick.')}\n\nscene outro (3s)\n  transition zoom 0.8s\n${title(t.cta)}\n${stagger()}`,
  },
  {
    id: 'weekly-report', label: 'Metrics report', build: (t, th) => `${H}\ntheme ${th}\n\nscene kpis (5s)\n  transition crossfade 0.85s\n${title('This week, in numbers.')}\n${stagger()}\n${bars(t, t.statUnit)}\n\nscene split (4.5s)\n  transition crossfade 0.85s\n${pie(t)}\n\nscene takeaway (4s)\n  transition zoom 0.8s\n${title(t.hook)}\n${stagger()}\n${body(t.body)}`,
  },
  {
    id: 'event-invite', label: 'Event invite', vertical: true, build: (t, th) => `${V}\ntheme ${th}\n\nscene save (3.5s)\n  transition crossfade 0.85s\n${title('Save the night.')}\n${stagger(110)}\n${typed(t.brand + ' · friday 8pm')}\n\nscene vibe (4s)\n  transition slide-left 0.7s\n  bg gradient #fafafc -> #edeaf7\n    pulse 5s\n${title('One evening only.')}\n${body(t.body)}\n\nscene rsvp (3.5s)\n  transition zoom 0.8s\n${title(t.cta)}\n${stagger()}\n${typed(t.ctaSub)}`,
  },
  {
    id: 'recipe', label: 'Recipe short', vertical: true, build: (t, th) => `${V}\ntheme ${th}\n\nscene intro (3s)\n  transition crossfade 0.85s\n${title(t.product)}\n${stagger()}\n${typed(t.tagline)}\n\nscene step-1 (3.5s)\n  transition slide-left 0.6s\n${title(t.steps[0])}\n${body('Start here — everything else follows.')}\n\nscene step-2 (3.5s)\n  transition slide-left 0.6s\n${title(t.steps[1])}\n${body('The part everyone rushes. Don\'t.')}\n\nscene step-3 (3.5s)\n  transition slide-left 0.6s\n${title(t.steps[2])}\n${body('Slow is smooth, smooth is fast.')}\n\nscene done (3s)\n  transition zoom 0.8s\n${title(t.cta)}\n${stagger()}`,
  },
  {
    id: 'countdown', label: 'Launch countdown', build: (t, th) => `${H}\ntheme ${th}\n\nscene announce (4s)\n  transition crossfade 0.85s\n${title('Something is coming.')}\n${stagger(110)}\n${typed(t.brand + ' · ' + t.product)}\n\nscene tease (4s)\n  transition crossfade 0.85s\n${title('Three days.')}\n${body(t.body)}\n\nscene features (4.5s)\n  transition slide-left 0.7s\n${title('What to expect.')}\n${bars(t, t.statUnit)}\n\nscene drop (3.5s)\n  transition zoom 0.8s\n${title(t.cta)}\n${stagger()}\n${typed(t.ctaSub)}`,
  },
  {
    id: 'quote', label: 'Quote card', vertical: true, build: (t, th) => `${V}\ntheme ${th}\n\nscene quote (5s)\n  transition crossfade 0.85s\n  bg gradient #fafafc -> #edeaf7\n    pulse 6s\n${title(`'${t.hook}'`)}\n    stagger words by 130ms\n    rise 26 over 0.8s\n${sub('— ' + t.brand)}\n\nscene share (3.5s)\n  transition crossfade 0.85s\n${title(t.cta)}\n${typed(t.ctaSub)}`,
  },
  {
    id: 'course-promo', label: 'Course promo', build: (t, th) => `${H}\ntheme ${th}\n\nscene intro (4s)\n  transition crossfade 0.85s\n${title('Learn it properly.')}\n${stagger()}\n${typed(t.brand + ' · a 4-week course')}\n\nscene curriculum (5s)\n  transition slide-left 0.7s\n${title('What you\'ll master.')}\n${bars(t, t.statUnit)}\n\nscene teaching (4s)\n  transition crossfade 0.85s\n${title(t.steps[0] + ' → ' + t.steps[2])}\n${body(t.body)}\n\nscene enroll (4s)\n  transition zoom 0.8s\n${title(t.cta)}\n${stagger()}\n${typed(t.ctaSub)}`,
  },
  {
    id: 'real-estate', label: 'Property tour', build: (t, th) => `${H}\ntheme ${th}\n\nscene exterior (4s)\n  transition crossfade 0.85s\n${title(t.brand + ' presents.')}\n${typed(t.product + ' · now viewing')}\n\nscene spaces (5s)\n  transition slide-left 0.7s\n${title('Light. Space. Calm.')}\n${stagger(110)}\n${body(t.body)}\n\nscene numbers (4.5s)\n  transition crossfade 0.85s\n${bars(t, t.statUnit)}\n\nscene viewing (4s)\n  transition zoom 0.8s\n${title(t.cta)}\n${typed(t.ctaSub)}`,
  },
  {
    id: 'fitness', label: 'Fitness plan', vertical: true, build: (t, th) => `${V}\ntheme ${th}\n\nscene start (3.5s)\n  transition crossfade 0.85s\n${title(t.brand + '.')} \n${stagger()}\n${typed(t.tagline)}\n\nscene plan (4.5s)\n  transition slide-left 0.7s\n${title('Your twelve weeks.')}\n${bars(t, t.statUnit)}\n\nscene session (4s)\n  transition crossfade 0.85s\n  bg grid\n${title(t.steps[0] + ' · ' + t.steps[1])}\n${body(t.body)}\n\nscene join (3.5s)\n  transition zoom 0.8s\n${title(t.cta)}\n${typed(t.ctaSub)}`,
  },
  {
    id: 'menu', label: 'Menu special', build: (t, th) => `${H}\ntheme ${th}\n\nscene tonight (4s)\n  transition crossfade 0.85s\n${title('Tonight at ' + t.brand + '.')}\n${typed(t.product)}\n\nscene dish (4.5s)\n  transition slide-left 0.7s\n${title(t.steps[0] + ', ' + t.steps[1] + '.')} \n${body(t.body)}\n\nscene pairing (4s)\n  transition crossfade 0.85s\n${pie(t)}\n\nscene book (3.5s)\n  transition zoom 0.8s\n${title(t.cta)}\n${stagger()}\n${typed(t.ctaSub)}`,
  },
  {
    id: 'travel-teaser', label: 'Travel teaser', vertical: true, build: (t, th) => `${V}\ntheme ${th}\n\nscene dream (4s)\n  transition crossfade 0.85s\n  bg gradient #fafafc -> #edeaf7\n    pulse 6s\n${title('Go far, stay long.')}\n    stagger words by 120ms\n${typed(t.brand + ' slow trips')}\n\nscene days (4.5s)\n  transition slide-left 0.7s\n${title('Ten slow days.')}\n${body(t.body)}\n\nscene book (3.5s)\n  transition zoom 0.8s\n${title(t.cta)}\n${typed(t.ctaSub)}`,
  },
  {
    id: 'app-promo', label: 'App promo', build: (t, th) => `${H}\ntheme ${th}\n\nscene open (3.5s)\n  transition crossfade 0.85s\n${title('Meet ' + t.brand + '.')} \n${stagger()}\n${typed(t.tagline)}\n\nscene flow (4.5s)\n  transition slide-left 0.7s\n  bg grid\n${title(t.steps[0] + ' → ' + t.steps[1] + ' → ' + t.steps[2])}\n${body(t.body)}\n\nscene rated (4s)\n  transition crossfade 0.85s\n${pie(t)}\n\nscene download (3.5s)\n  transition zoom 0.8s\n${title(t.cta)}\n${typed(t.ctaSub)}`,
  },
  {
    id: 'podcast', label: 'Podcast episode', build: (t, th) => `${H}\ntheme ${th}\n\nscene cover (4s)\n  transition crossfade 0.85s\n${title('Ep. 12 — ' + t.hook)}\n${stagger(100)}\n${typed(t.brand + ' · 38 min')}\n\nscene about (4.5s)\n  transition slide-left 0.7s\n${title('In this episode.')}\n${body(t.body)}\n\nscene listen (3.5s)\n  transition zoom 0.8s\n${title(t.cta)}\n${typed(t.ctaSub)}`,
  },
  {
    id: 'music-release', label: 'Music release', build: (t, th) => `${H}\ntheme ${th}\n\nscene announce (4s)\n  transition crossfade 0.85s\n${title('Out now: Midnight.')} \n    stagger words by 120ms\n${typed(t.brand)}\n\nscene tracks (4.5s)\n  transition slide-left 0.7s\n  bg solid #0f1218\n${title('Six tracks, one take.')}\n${body(t.body)}\n\nscene listen (3.5s)\n  transition zoom 0.8s\n${title(t.cta)}\n${typed(t.ctaSub)}`,
  },
  {
    id: 'sale', label: 'Sale announcement', build: (t, th) => `${H}\ntheme ${th}\n\nscene banner (3.5s)\n  transition crossfade 0.85s\n${title('30% off everything.')}\n    stagger words by 100ms\n${typed(t.brand + ' · this week only')}\n\nscene picks (4.5s)\n  transition slide-left 0.7s\n${title('Editor\'s picks.')}\n${bars(t, t.statUnit)}\n\nscene hurry (3.5s)\n  transition zoom 0.8s\n${title(t.cta)}\n${typed(t.ctaSub)}`,
  },
  {
    id: 'portfolio', label: 'Portfolio intro', build: (t, th) => `${H}\ntheme ${th}\n\nscene open (4s)\n  transition crossfade 0.85s\n${title('Hi, I make things.')}\n    stagger words by 110ms\n${typed(t.brand + ' · selected work 2020-2026')}\n\nscene work (5s)\n  transition slide-left 0.7s\n${title('What I do.')}\n${bars(t, t.statUnit)}\n\nscene contact (4s)\n  transition zoom 0.8s\n${title('Let\'s talk.')}\n${typed(t.ctaSub)}`,
  },
  {
    id: 'webinar', label: 'Webinar invite', build: (t, th) => `${H}\ntheme ${th}\n\nscene announce (3.5s)\n  transition crossfade 0.85s\n${title('Free live webinar.')}\n${typed(t.brand + ' · thursday 6pm')}\n\nscene agenda (4.5s)\n  transition slide-left 0.7s\n${title('We\'ll cover.')}\n${body(t.steps[0] + ', ' + t.steps[1] + ' and ' + t.steps[2] + '.')}\n\nscene register (4s)\n  transition zoom 0.8s\n${title('Save your seat.')}\n${stagger()}\n${typed(t.ctaSub)}`,
  },
  {
    id: 'greeting', label: 'Season greeting', build: (t, th) => `${H}\ntheme ${th}\n\nscene greet (4.5s)\n  transition crossfade 0.85s\n  bg gradient #fafafc -> #edeaf7\n    pulse 6s\n${title('Warm wishes from ' + t.brand + '.')} \n    stagger words by 130ms\n${body(t.body)}\n\nscene thanks (4s)\n  transition crossfade 0.85s\n${title('Thank you for a good year.')}\n${stagger()}\n${typed(t.ctaSub)}`,
  },
  {
    id: 'nonprofit', label: 'Nonprofit appeal', build: (t, th) => `${H}\ntheme ${th}\n\nscene story (4.5s)\n  transition crossfade 0.85s\n${title('Small gift. Big ripple.')}\n    stagger words by 110ms\n${body(t.body)}\n\nscene impact (5s)\n  transition slide-left 0.7s\n${title('Where it goes.')}\n${pie(t)}\n\nscene act (4s)\n  transition zoom 0.8s\n${title(t.cta)}\n${typed(t.ctaSub)}`,
  },
  {
    id: 'tutorial', label: 'Tutorial steps', build: (t, th) => `${H}\ntheme ${th}\n\nscene intro (3.5s)\n  transition crossfade 0.85s\n${title(t.product + ', step by step.')}\n${stagger()}\n${typed('no jargon, promise')}\n\nscene step-1 (4s)\n  transition slide-left 0.7s\n${title('1 · ' + t.steps[0])}\n${body(t.body)}\n\nscene step-2 (4s)\n  transition slide-left 0.7s\n${title('2 · ' + t.steps[1])}\n${body('Watch the corners, not the clock.')}\n\nscene step-3 (4s)\n  transition slide-left 0.7s\n${title('3 · ' + t.steps[2])}\n${body('Now it\'s yours.')}\n\nscene outro (3s)\n  transition zoom 0.8s\n${title(t.cta)}\n${stagger()}`,
  },
];

// themes for templates: mostly built-ins, sometimes a catalog style
function themeFor(i: number): string {
  const roll = i % 10;
  if (roll < 6) return 'aurora';
  if (roll < 8) return 'swiss';
  return CATALOG_STYLE_NAMES[(i * 7 + 11) % CATALOG_STYLE_NAMES.length];
}

export const CATALOG_TEMPLATES: CatalogTemplate[] = [
  {
    id: 'cat-tpl-day-ad',
    title: 'Ambient day-long ad loop',
    author: 'clay.co',
    price: 8,
    description:
      'A slow rotating billboard loop — duplicate blocks to stretch it across hours, even a whole day. 600s scenes, explicit crossfade.',
    code: `// A day-long ambient ad — duplicate blocks to fill hours.
${H}
theme midnight-lux

scene block-1 (600s)
  transition crossfade 1.5s
  bg solid #0e0e16
  shape ring
    pulse 6s
${title('Your brand, all day.')}
  fade in 1.2s
  rise 20 over 1.4s
  stagger words by 220ms

scene block-2 (600s)
  transition crossfade 1.5s
  bg solid #1a1a2e
  shape circle
    pulse 7s
${title('Quiet. Premium. Present.')}
  fade in 1.2s
  rise 20 over 1.4s
  stagger words by 220ms`,
  },
  ...BUILDERS.flatMap((b, bi) =>
    TOPICS.map((t, ti) => {
      const i = bi * TOPICS.length + ti;
      const theme = themeFor(i);
      return {
        id: `cat-tpl-${b.id}-${t.key}`,
        title: `${b.label} — ${t.brand}`,
        author: ['SceneLang', 'clay.co', 'velvet', 'leafstudio', 'petal', 'northform', 'atelier'][i % 7],
        price: i % 5 === 0 ? 0 : [0, 2, 3, 0, 5, 1, 0, 4][i % 8],
        description: `${b.label} structure with ${t.brand} copy — swap the words and ship. ${b.vertical ? 'Vertical 9:16.' : '16:9 landscape.'} Explicit v2 actions throughout.`,
        code: b.build(t, theme),
      };
    }),
  ),
];
