export type DeviceType = 'android' | 'ios';
export type Orientation = 'portrait' | 'landscape';
export type TemplateName =
  | 'orbit' | 'hero-reveal' | 'float' | 'flip'
  | 'rise' | 'tilt-shift' | 'carousel' | 'bounce-drop'
  | 'slide-in' | 'spiral' | 'cinematic-pan'
  | 'slow-pan' | 'minimal-sway'
  | 'horizontal-slide' | 'zoom-rotate';
export type Resolution = '1080p' | '4k';
export type ExportStatus = 'idle' | 'rendering' | 'encoding' | 'done' | 'error';

export interface TemplateConfig {
  id: TemplateName;
  name: string;
  description: string;
  icon: string;
  duration: number; // seconds
}

export type TextAnimationType = 'fade' | 'slide-up' | 'typewriter' | 'scale' | 'none';

export interface TextOverlay {
  id: string;
  text: string;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  fontSize: number;
  animationType: TextAnimationType;
}

export interface SceneSettings {
  bgColor: string;
  bgColor2?: string;
  bgGradient?: boolean;
  ambientIntensity: number;
  directionalColor: string;
  directionalIntensity: number;
  zoom: number; // multiplier for camera distance
  textSpeed?: number;
  texts?: TextOverlay[];
}

export type ActiveTool = 'upload' | 'scene' | 'export' | null;

export interface AppState {
  activeTool: ActiveTool;
  screenshot: File | null;
  screenshotUrl: string | null;
  screenshotOrientation: Orientation | null;
  device: DeviceType;
  orientation: Orientation;
  template: TemplateName;
  speed: number;
  scene: SceneSettings;
  resolution: Resolution;
  exportStatus: ExportStatus;
  exportProgress: number;
  error: string | null;
  orientationMismatch: boolean;
  selectedTextId: string | null;
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: 'orbit',
    name: 'Orbit',
    description: 'Camera orbits around the device',
    icon: '🌀',
    duration: 3,
  },
  {
    id: 'hero-reveal',
    name: 'Hero Reveal',
    description: 'Camera zooms in with reveal effect',
    icon: '✨',
    duration: 3.5,
  },
  {
    id: 'float',
    name: 'Float',
    description: 'Device gently bobs and tilts',
    icon: '🫧',
    duration: 4,
  },
  {
    id: 'flip',
    name: 'Flip',
    description: 'Dramatic back-to-front card flip',
    icon: '🃏',
    duration: 2,
  },
  {
    id: 'rise',
    name: 'Rise',
    description: 'Device rises from below frame',
    icon: '🚀',
    duration: 3,
  },
  {
    id: 'tilt-shift',
    name: 'Tilt Shift',
    description: 'Isometric angle with slow pan',
    icon: '📐',
    duration: 4,
  },
  {
    id: 'carousel',
    name: 'Carousel',
    description: 'Turntable rotation with camera bob',
    icon: '🎠',
    duration: 4,
  },
  {
    id: 'bounce-drop',
    name: 'Bounce Drop',
    description: 'Drops in from above and bounces',
    icon: '⬇️',
    duration: 2.5,
  },
  {
    id: 'slide-in',
    name: 'Slide In',
    description: 'Slides in from the side with ease',
    icon: '➡️',
    duration: 2.5,
  },
  {
    id: 'spiral',
    name: 'Spiral',
    description: 'Camera spirals inward to device',
    icon: '🌪️',
    duration: 4,
  },
  {
    id: 'cinematic-pan',
    name: 'Cinematic Pan',
    description: 'Wide horizontal dolly shot',
    icon: '🎥',
    duration: 4.5,
  },
  {
    id: 'slow-pan',
    name: 'Slow Pan',
    description: 'Slow elegant side-to-side camera pan',
    icon: '↔️',
    duration: 5,
  },
  {
    id: 'minimal-sway',
    name: 'Minimal Sway',
    description: 'Subtle swaying product rotation',
    icon: '⚖️',
    duration: 4,
  },
  {
    id: 'horizontal-slide',
    name: 'Horizontal Slide',
    description: 'Phone slides in from the right side and stays on screen',
    icon: '↔️',
    duration: 4,
  },
  {
    id: 'zoom-rotate',
    name: 'Zoom-In and Rotate',
    description: 'Camera rapid zoom-in and rotation lock on screen',
    icon: '🔎',
    duration: 4,
  },
];

export const DEFAULT_SCENE: SceneSettings = {
  bgColor: '#fcf9ea',
  bgColor2: '#badfdb',
  bgGradient: true,
  ambientIntensity: 0.8,
  directionalColor: '#ffffff',
  directionalIntensity: 1.5,
  zoom: 1.0,
  textSpeed: 1.0,
  texts: [],
};
