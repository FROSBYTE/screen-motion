export type DeviceType = 'android' | 'ios';
export type Orientation = 'portrait' | 'landscape';
export type TemplateName =
  | 'orbit' | 'spin' | 'hero-reveal' | 'float' | 'showcase' | 'swing' | 'flip'
  | 'drift' | 'rise' | 'tilt-shift' | 'carousel' | 'bounce-drop'
  | 'slide-in' | 'zoom-pulse' | 'spiral' | 'rock' | 'cinematic-pan';
export type Resolution = '1080p' | '4k';
export type ExportStatus = 'idle' | 'rendering' | 'encoding' | 'done' | 'error';

export interface TemplateConfig {
  id: TemplateName;
  name: string;
  description: string;
  icon: string;
  duration: number; // seconds
}

export interface SceneSettings {
  bgColor1: string;
  bgColor2: string;
  bgGradient: boolean;
  ambientIntensity: number;
  directionalColor: string;
  directionalIntensity: number;
  rimColor: string;
  rimIntensity: number;
  shadowStrength: number;
  zoom: number; // multiplier for camera distance
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
    id: 'spin',
    name: 'Spin',
    description: 'Device spins 360° around axis',
    icon: '🔄',
    duration: 2.5,
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
    id: 'showcase',
    name: 'Showcase',
    description: 'Multi-angle cinematic reveal',
    icon: '🎬',
    duration: 5,
  },
  {
    id: 'swing',
    name: 'Swing',
    description: 'Pendulum swing with bounce',
    icon: '🎯',
    duration: 3,
  },
  {
    id: 'flip',
    name: 'Flip',
    description: 'Dramatic back-to-front card flip',
    icon: '🃏',
    duration: 2,
  },
  {
    id: 'drift',
    name: 'Drift',
    description: 'Slow lateral drift with parallax',
    icon: '🌊',
    duration: 4,
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
    id: 'zoom-pulse',
    name: 'Zoom Pulse',
    description: 'Rhythmic zoom in and out',
    icon: '🔍',
    duration: 3,
  },
  {
    id: 'spiral',
    name: 'Spiral',
    description: 'Camera spirals inward to device',
    icon: '🌪️',
    duration: 4,
  },
  {
    id: 'rock',
    name: 'Rock',
    description: 'Gentle rocking like a cradle',
    icon: '🪨',
    duration: 3.5,
  },
  {
    id: 'cinematic-pan',
    name: 'Cinematic Pan',
    description: 'Wide horizontal dolly shot',
    icon: '🎥',
    duration: 4.5,
  },
];

export const DEFAULT_SCENE: SceneSettings = {
  bgColor1: '#ffffff',
  bgColor2: '#ffffff',
  bgGradient: true,
  ambientIntensity: 0.7,
  directionalColor: '#ffffff',
  directionalIntensity: 1.2,
  rimColor: '#06b6d4',
  rimIntensity: 0.5,
  shadowStrength: 0.6,
  zoom: 1.0,
};
