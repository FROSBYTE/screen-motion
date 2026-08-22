export type DeviceType = 'android' | 'ios';
export type Orientation = 'portrait' | 'landscape';
export type TemplateName =
  | 'orbit' | 'hero-reveal' | 'float' | 'flip'
  | 'rise' | 'tilt-shift' | 'bounce-drop'
  | 'slide-in' | 'spiral' | 'cinematic-pan'
  | 'slow-pan' | 'horizontal-slide'
  | 'infinity-loop' | 'dynamic-showcase'
  | 'corkscrew-reveal' | 'depth-zoom' | 'corner-drop'
  | '3d-spin-flip' | 'perspective-float' | 'zoom-pulse';
export type Resolution = '1080p' | '4k';
export type ExportStatus = 'idle' | 'rendering' | 'encoding' | 'done' | 'error';

export interface TemplateConfig {
  id: TemplateName;
  name: string;
  description: string;
  icon: string;
  duration: number; // seconds
}

export type TextAnimationType =
  | 'none'
  | 'bottom-up-letters'
  | 'kinetic-center-build'
  | 'line-by-line-slide'
  | 'mask-reveal-up'
  | 'reveal-text'
  | 'short-slide-down'
  | 'blur-out-up'
  | 'soft-blur-in'
  | 'spring-scale-in'
  | 'stagger-from-center'
  | 'depth-parallax-words'
  | 'fade-through'
  | 'focus-blur-resolve'
  | 'micro-scale-fade'
  | 'scale-down-fade'
  | 'per-character-rise'
  | 'per-word-crossfade'
  | 'text-reveal'
  | 'dia-text-reveal';

export interface TextOverlay {
  id: string;
  text: string;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  fontSize: number;
  animationType: TextAnimationType;
  previewTrigger?: number;
  textUpdatedAt?: number;
  delay?: number;
  animationSpeed: number;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  fontFamily?: string;
  order?: number;
}

export type ImageAnimationType = 'fade-in-out' | 'bounce' | 'spin' | 'none';

export interface ImageOverlay {
  id: string;
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  animationType: ImageAnimationType;
  animationSpeed: number;
  delay?: number;
  previewTrigger?: number;
  order?: number;
}

export interface SceneSettings {
  bgColor: string;
  bgColor2?: string;
  bgGradient?: boolean;
  bgImage?: string | null; // Background image preset or null for color/gradient
  ambientIntensity: number;
  directionalColor: string;
  directionalIntensity: number;
  zoom: number; // multiplier for camera distance
  offsetX?: number; // horizontal device position offset
  offsetY?: number; // vertical device position offset
  rotationX?: number; // X rotation of 3D device in degrees
  rotationY?: number; // Y rotation of 3D device in degrees
  textSpeed?: number;
  texts?: TextOverlay[];
  images?: ImageOverlay[];
}

export type ActiveTool = 'upload' | 'scene' | 'export' | null;
export type MediaType = 'image' | 'video';

export interface AppState {
  activeTool: ActiveTool;
  screenshot: File | null;
  screenshotUrl: string | null;
  screenshotOrientation: Orientation | null;
  mediaType: MediaType;
  device: DeviceType;
  deviceColor: string;
  orientation: Orientation;
  template: TemplateName;
  speed: number;
  scene: SceneSettings;
  resolution: Resolution;
  exportStatus: ExportStatus;
  exportProgress: number;
  error: string | null;
  orientationMismatch?: boolean;
  previewTrigger?: number;
  selectedTextId?: string | null;
}

export interface AlignmentGuide {
  id: string;
  type: 'vertical' | 'horizontal';
  positionPercent: number; // 0 to 100 relative to canvas container
  snapType: 'canvas-center' | 'element-center' | 'element-edge';
  label?: string;
  matchedTarget?: string;
}

export interface ElementBounds3D {
  id: string;
  x: number; // center x in 3D
  y: number; // center y in 3D
  width3D: number;
  height3D: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface SnapResult {
  x: number;
  y: number;
  guides: AlignmentGuide[];
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: 'orbit',
    name: 'Orbit 3D',
    description: 'Smooth 360-degree rotation around the 3D device',
    icon: '3d_rotation',
    duration: 5,
  },
  {
    id: 'hero-reveal',
    name: 'Hero Reveal',
    description: 'Swoops up from bottom angle to center hero framing',
    icon: 'north_west',
    duration: 4,
  },
  {
    id: 'float',
    name: 'Floating Drift',
    description: 'Gentle weightless hover with dynamic shadow drift',
    icon: 'air',
    duration: 6,
  },
  {
    id: 'flip',
    name: 'Flip & Land',
    description: 'Full 360 flip transition ending in crisp focus',
    icon: 'flip',
    duration: 4,
  },
  {
    id: 'rise',
    name: 'Vertical Rise',
    description: 'Elevates smoothly from bottom to eye level',
    icon: 'arrow_upward',
    duration: 4,
  },
  {
    id: 'tilt-shift',
    name: 'Tilt Shift',
    description: 'Dynamic multi-axis angular camera pan',
    icon: 'screen_rotation',
    duration: 5,
  },
  {
    id: 'bounce-drop',
    name: 'Bounce Drop',
    description: 'Playful impact drop with elastic bounce settle',
    icon: 'south',
    duration: 3.5,
  },
  {
    id: 'slide-in',
    name: 'Side Slide',
    description: 'Glides horizontally into center frame',
    icon: 'east',
    duration: 4,
  },
  {
    id: 'spiral',
    name: 'Spiral In',
    description: 'Spirals into position with perspective zoom',
    icon: 'cyclone',
    duration: 5,
  },
  {
    id: 'cinematic-pan',
    name: 'Cinematic Pan',
    description: 'Slow dramatic sweep with focal depth accent',
    icon: 'movie',
    duration: 6,
  },
  {
    id: 'slow-pan',
    name: 'Slow Pan',
    description: 'Ultra-subtle, elegant slow lateral drift',
    icon: 'pan_tool',
    duration: 6,
  },

  {
    id: 'horizontal-slide',
    name: 'Horizontal Slide',
    description: 'Clean parallel horizontal sweep across scene',
    icon: 'swap_horiz',
    duration: 4,
  },
  {
    id: 'infinity-loop',
    name: 'Infinity Loop',
    description: 'Figure-8 looping rotation path',
    icon: 'all_inclusive',
    duration: 8,
  },
  {
    id: 'dynamic-showcase',
    name: 'Dynamic Showcase',
    description: 'Multi-stage promotional animation sequence',
    icon: 'auto_awesome',
    duration: 7,
  },
  {
    id: 'corkscrew-reveal',
    name: 'Corkscrew Reveal',
    description: '3D multi-axis spiral entry with smooth power curve',
    icon: 'cyclone',
    duration: 4,
  },
  {
    id: 'depth-zoom',
    name: 'Depth Zoom',
    description: 'Dolly-zoom camera sweep across diagonal perspective',
    icon: 'zoom_in',
    duration: 4.5,
  },
  {
    id: 'corner-drop',
    name: 'Corner Drop',
    description: 'Top-corner drop with overshoot bounce & hover',
    icon: 'south_west',
    duration: 3.8,
  },
  {
    id: '3d-spin-flip',
    name: '3D Spin Flip',
    description: 'Dynamic 360-degree spin twist with elastic bounce',
    icon: 'autorenew',
    duration: 4.0,
  },
  {
    id: 'perspective-float',
    name: 'Perspective Float',
    description: 'Floating isometric 3D angle with weightless drift',
    icon: 'view_in_ar',
    duration: 6.0,
  },
  {
    id: 'zoom-pulse',
    name: 'Zoom Pulse',
    description: 'Dolly-zoom push-in focus highlight to reveal UI detail',
    icon: 'center_focus_weak',
    duration: 4.5,
  },
];

export const DEFAULT_SCENE: SceneSettings = {
  bgColor: '#000000',
  bgColor2: '#ffffff',
  bgGradient: true,
  bgImage: null,
  ambientIntensity: 1.0,
  directionalColor: '#ffffff',
  directionalIntensity: 1.0,
  zoom: 1.0,
  offsetX: 0,
  offsetY: 0,
  rotationX: 0,
  rotationY: 0,
  textSpeed: 1.0,
  texts: [],
  images: [],
};
