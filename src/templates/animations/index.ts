import gsap from 'gsap';
import * as THREE from 'three';
import { TemplateName, Orientation } from '@/types';
import { AnimationTarget, TemplateAnimation, AnimationBuilder } from './types';

// Re-export shared types so consumers can import from this barrel
export type { AnimationTarget, TemplateAnimation };

// Import individual animation builders
import { buildOrbit } from './orbit';
import { buildHeroReveal } from './hero-reveal';
import { buildFloat } from './float';
import { buildFlip } from './flip';
import { buildRise } from './rise';
import { buildTiltShift } from './tilt-shift';
import { buildBounceDrop } from './bounce-drop';
import { buildSlideIn } from './slide-in';
import { buildSpiral } from './spiral';
import { buildCinematicPan } from './cinematic-pan';
import { buildSlowPan } from './slow-pan';
import { buildHorizontalSlide } from './horizontal-slide';
import { buildInfinityLoop } from './infinity-loop';
import { buildDynamicShowcase } from './dynamic-showcase';
import { buildCorkscrewReveal } from './corkscrew-reveal';
import { buildDepthZoom } from './depth-zoom';
import { buildCornerDrop } from './corner-drop';
import { build3DSpinFlip } from './3d-spin-flip';
import { buildPerspectiveFloat } from './perspective-float';
import { buildZoomPulse } from './zoom-pulse';

/**
 * Registry mapping template names to their builder functions.
 * To add a new animation, create a new file and add an entry here.
 * To remove an animation, delete the file and remove the entry.
 */
const builders: Record<string, AnimationBuilder> = {
  'orbit': buildOrbit,
  'hero-reveal': buildHeroReveal,
  'float': buildFloat,
  'flip': buildFlip,
  'rise': buildRise,
  'tilt-shift': buildTiltShift,
  'bounce-drop': buildBounceDrop,
  'slide-in': buildSlideIn,
  'spiral': buildSpiral,
  'cinematic-pan': buildCinematicPan,
  'slow-pan': buildSlowPan,
  'horizontal-slide': buildHorizontalSlide,
  'infinity-loop': buildInfinityLoop,
  'dynamic-showcase': buildDynamicShowcase,
  'corkscrew-reveal': buildCorkscrewReveal,
  'depth-zoom': buildDepthZoom,
  'corner-drop': buildCornerDrop,
  '3d-spin-flip': build3DSpinFlip,
  'perspective-float': buildPerspectiveFloat,
  'zoom-pulse': buildZoomPulse,
};

export function createAnimation(
  template: TemplateName,
  orientation: Orientation,
  realTarget: AnimationTarget,
  speed: number
): TemplateAnimation {
  const tl = gsap.timeline({
    paused: true,
    repeat: 0,
    yoyo: false
  });

  // Reset real camera position to orientation default
  const baseCamZ = 4;
  const baseCamY = 0;
  realTarget.camera.position.set(0, baseCamY, baseCamZ);
  realTarget.camera.lookAt(0, 0, 0);

  // Look up the builder and invoke it
  const builder = builders[template];
  if (builder) {
    const duration = builder(tl, realTarget, 'portrait', speed);
    return { timeline: tl, duration };
  }

  // Fallback for unknown templates
  return { timeline: tl, duration: 3 };
}
