// SceneLang v2 — core scene-graph types.
// Philosophy: every action is written out. No bundled "combo" words.
// Pipeline: SceneLang code -> parser -> VideoSpec (timeline JSON) -> canvas renderer

/** One explicit action on an element, e.g. "fade in 0.6s" or "rise 24 over 0.8s". */
export interface ElemAction {
  kind:
    | 'fade-in'
    | 'fade-out'
    | 'move' // rise / drop / slide left / slide right / drift
    | 'zoom' // zoom from X to Y over D
    | 'spin' // spin Ndeg over D
    | 'stagger' // stagger words|letters|items by N
    | 'type' // type on over D
    | 'wait' // wait N
    | 'pulse' // pulse D (looping breath)
    | 'grow' // bars grow over D
    | 'sweep' // pie sweep over D
    | 'bob'; // sprites bob N over D (looping float)
  /** ms from element start (computed from preceding `wait`s by the parser) */
  startMs: number;
  /** explicit duration; 0 for instantaneous / not applicable */
  durMs: number;
  /** movement distance in px (move, bob) or degrees (spin) */
  amount?: number;
  /** movement or stagger unit */
  dir?: 'up' | 'down' | 'left' | 'right';
  unit?: 'words' | 'letters' | 'items';
  /** zoom range in percent (e.g. 100 -> 112) */
  from?: number;
  to?: number;
  /** loop the action (pulse, bob) */
  loop?: boolean;
}

export type SceneTransition = 'crossfade' | 'cut' | 'slide-left' | 'slide-right' | 'zoom';

export interface Transition {
  kind: SceneTransition;
  ms: number;
}

export type BgVariant = 'gradient' | 'solid' | 'grid' | 'image';

export type ShapeVariant = 'circle' | 'ring' | 'rect';

export interface ChartPoint {
  label: string;
  value: number;
}

/** A user-imported file, referenced by name in code. */
export interface AssetRef {
  name: string;
  kind: 'image' | 'text' | 'csv';
  /** data URL for images */
  dataUrl?: string;
  /** raw content for text/csv */
  content?: string;
}

export type SceneElement =
  | {
      kind: 'bg';
      variant: BgVariant;
      colors: string[];
      src?: string; // for bg image
      actions: ElemAction[];
    }
  | { kind: 'title' | 'subtitle' | 'text'; text: string; actions: ElemAction[] }
  | { kind: 'bars' | 'pie'; data: ChartPoint[]; from?: string; actions: ElemAction[] }
  | { kind: 'image' | 'sprite'; src: string; actions: ElemAction[] }
  | { kind: 'lines'; name: string; items: string[]; actions: ElemAction[] }
  | { kind: 'shape'; variant: ShapeVariant; actions: ElemAction[] };

export interface Scene {
  name: string;
  durationMs: number;
  transition: Transition;
  elements: SceneElement[];
  /** computed by parser */
  startMs: number;
  endMs: number;
  index: number;
}

export interface VideoSpec {
  width: number;
  height: number;
  fps: number;
  theme: string;
  scenes: Scene[];
  totalMs: number;
}

export interface ParseError {
  line: number;
  message: string;
}

export interface ParseResult {
  spec: VideoSpec | null;
  errors: ParseError[];
}
