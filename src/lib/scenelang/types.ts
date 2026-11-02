// SceneLang — core scene-graph types
// Pipeline: SceneLang code -> parser -> VideoSpec (timeline JSON) -> canvas renderer

export type EnterAnim =
  | 'fade'
  | 'fade-up'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'none';

export type TextAnim = 'kinetic' | 'typewriter' | 'pop' | 'fade' | 'fade-up';

export type ChartAnim = 'grow' | 'spin' | 'pop' | 'fade';

export type BgVariant = 'gradient' | 'solid' | 'grid';

export type ShapeVariant = 'circle' | 'ring' | 'rect';

export interface ChartPoint {
  label: string;
  value: number;
}

export type SceneElement =
  | {
      kind: 'bg';
      variant: BgVariant;
      colors: string[];
      anim: 'pulse' | 'none';
    }
  | { kind: 'title' | 'subtitle' | 'text'; text: string; anim: TextAnim }
  | { kind: 'bars' | 'pie'; data: ChartPoint[]; anim: ChartAnim }
  | { kind: 'image'; src: string; anim: 'zoom-in' | 'pan' | 'fade' }
  | { kind: 'shape'; variant: ShapeVariant; anim: 'pulse' | 'glow' | 'fade' };

export interface Scene {
  name: string;
  durationMs: number;
  enter: EnterAnim;
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
