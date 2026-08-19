export { default as CountUp } from './CountUp';
export { default as AnimatedList } from './AnimatedList';
export { default as LogoLoop } from './LogoLoop';
export { default as AILoader } from './AILoader';
export { default as BubbleMenu } from './BubbleMenu';
export { default as Folder } from './Folder';
export { default as UnlumenAnimatedList } from './UnlumenAnimatedList';
export { default as WordRotate } from './WordRotate';
export { default as Highlighter } from './Highlighter';
export { default as AnimatedBeam } from './AnimatedBeam';
export { default as OrbitingCircles } from './OrbitingCircles';
export { default as TextReveal } from './TextReveal';
export { default as SkeletonShimmer } from './SkeletonShimmer';
export { default as Text3DFlip } from './Text3DFlip';
export { default as MediaUpload } from './MediaUpload';
export { default as VideoUpload } from './VideoUpload';
export { default as ImageUpload } from './ImageUpload';
export { default as PhoneDevice } from './PhoneDevice';
export { default as MaskedHeading } from './MaskedHeading';
export { default as DiaTextReveal } from './DiaTextReveal';

export type ComponentTemplateName =
  | 'count-up'
  | 'animated-list'
  | 'logo-loop'
  | 'ai-loader'
  | 'bubble-menu'
  | 'folder'
  | 'unlumen-animated-list'
  | 'word-rotate'
  | 'highlighter'
  | 'animated-beam'
  | 'orbiting-circles'
  | 'text-reveal'
  | 'dia-text-reveal'
  | 'skeleton-shimmer'
  | 'text-3d-flip'
  | 'camera-zoom'
  | 'media-upload'
  | 'video-upload'
  | 'image'
  | 'phone-device'
  | 'masked-heading';

export interface ComponentTemplateConfig {
  id: ComponentTemplateName;
  name: string;
  description: string;
  category: 'text' | 'component' | 'background';
  source: 'reactbits' | 'smoothui';
}

export const COMPONENT_TEMPLATES: ComponentTemplateConfig[] = [
  {
    id: 'image',
    name: 'Image',
    description: 'Upload and display custom image graphics',
    category: 'component',
    source: 'smoothui',
  },
  {
    id: 'video-upload',
    name: 'Video Upload',
    description: 'Upload and play custom videos with playback & frame controls',
    category: 'component',
    source: 'smoothui',
  },
  {
    id: 'media-upload',
    name: 'Image / Video',
    description: 'Upload images or videos with enter/exit animations',
    category: 'component',
    source: 'smoothui',
  },
  {
    id: 'count-up',
    name: 'Count Up',
    description: 'Animated number counter with easing',
    category: 'text',
    source: 'reactbits',
  },
  {
    id: 'animated-list',
    name: 'Animated List',
    description: 'Items appear one by one with slide animation',
    category: 'component',
    source: 'reactbits',
  },
  {
    id: 'logo-loop',
    name: 'Logo Loop',
    description: 'Infinite scrolling logo marquee',
    category: 'component',
    source: 'reactbits',
  },
  {
    id: 'ai-loader',
    name: 'AI Loader',
    description: 'Animated loading indicators (dots, bar, grid)',
    category: 'component',
    source: 'smoothui',
  },
  {
    id: 'bubble-menu',
    name: 'Bubble Menu',
    description: 'Circular expanding menu with spring physics',
    category: 'component',
    source: 'reactbits',
  },
  {
    id: 'folder',
    name: 'Folder',
    description: 'Animated folder with paper items reveal',
    category: 'component',
    source: 'reactbits',
  },
  {
    id: 'unlumen-animated-list',
    name: 'Notification List',
    description: 'Stacking notification cards with spring animation',
    category: 'component',
    source: 'reactbits',
  },
  {
    id: 'word-rotate',
    name: 'Word Rotate',
    description: 'Rotating words with slide transition',
    category: 'text',
    source: 'reactbits',
  },
  {
    id: 'highlighter',
    name: 'Highlighter',
    description: 'Text with animated highlight sweep',
    category: 'text',
    source: 'reactbits',
  },
  {
    id: 'orbiting-circles',
    name: 'Orbiting Circles',
    description: 'Items orbiting in a circular path',
    category: 'component',
    source: 'reactbits',
  },
  {
    id: 'dia-text-reveal',
    name: 'Dia Text Reveal',
    description: 'Horizontal gradient color band shine sweep across text',
    category: 'text',
    source: 'smoothui',
  },
  {
    id: 'skeleton-shimmer',
    name: 'Skeleton Shimmer',
    description: 'Loading skeleton with animated shimmer effect',
    category: 'component',
    source: 'smoothui',
  },
  {
    id: 'text-3d-flip',
    name: 'Text 3D Flip',
    description: '3D letter flip with staggered animation',
    category: 'text',
    source: 'reactbits',
  },
  {
    id: 'camera-zoom',
    name: 'Camera Zoom',
    description: 'Smooth zoom in then zoom out effect on the scene',
    category: 'component',
    source: 'smoothui',
  },
  {
    id: 'phone-device',
    name: 'Phone Device',
    description: 'iPhone or Android device frame with screen content',
    category: 'component',
    source: 'smoothui',
  },
  {
    id: 'masked-heading',
    name: 'Masked Heading',
    description: 'Text with image/video fill, parallax, and reveal animations',
    category: 'text',
    source: 'reactbits',
  },
];
