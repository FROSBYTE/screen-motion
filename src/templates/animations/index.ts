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

  // Keep track of initial camera and device states
  const initialCamPos = new THREE.Vector3(0, baseCamY, baseCamZ);
  const dummyCameraPosition = new THREE.Vector3().copy(initialCamPos);
  const dummyDeviceScale = new THREE.Vector3(1, 1, 1);

  // Intercept camera position updates and apply inverse translation to device position
  const proxiedCameraPosition = new Proxy(realTarget.camera.position, {
    set(targetVec, prop, value, receiver) {
      if (prop === 'x' || prop === 'y' || prop === 'z') {
        const numVal = Number(value);
        dummyCameraPosition[prop as 'x' | 'y' | 'z'] = numVal;

        const originalVal = initialCamPos[prop as 'x' | 'y' | 'z'];
        const delta = numVal - originalVal;

        // Move device in the opposite direction (camera translation -> device translation)
        realTarget.device.position[prop as 'x' | 'y' | 'z'] = -delta;
        return true;
      }
      return Reflect.set(targetVec, prop, value, receiver);
    },
    get(targetVec, prop, receiver) {
      if (prop === 'x' || prop === 'y' || prop === 'z') {
        return dummyCameraPosition[prop as 'x' | 'y' | 'z'];
      }
      return Reflect.get(targetVec, prop, receiver);
    }
  });

  // Intercept device scale updates and block them to keep device size constant
  const proxiedDeviceScale = new Proxy(realTarget.device.scale, {
    set(targetVec, prop, value, receiver) {
      if (prop === 'x' || prop === 'y' || prop === 'z') {
        dummyDeviceScale[prop as 'x' | 'y' | 'z'] = Number(value);
        return true;
      }
      return Reflect.set(targetVec, prop, value, receiver);
    },
    get(targetVec, prop, receiver) {
      if (prop === 'x' || prop === 'y' || prop === 'z') {
        return dummyDeviceScale[prop as 'x' | 'y' | 'z'];
      }
      return Reflect.get(targetVec, prop, receiver);
    }
  });

  // Intercept device rotation to lock Z-rotation to 0 (no orientation-based rotation)
  const proxiedDeviceRotation = new Proxy(realTarget.device.rotation, {
    get(targetEuler, prop, receiver) {
      if (prop === 'set') {
        return function(x: number, y: number, z: number, order?: THREE.EulerOrder) {
          return targetEuler.set(x, y, 0, order);
        };
      }
      if (prop === 'z') {
        return 0;
      }
      return Reflect.get(targetEuler, prop, receiver);
    },
    set(targetEuler, prop, value, receiver) {
      if (prop === 'z' || prop === '_z') {
        return Reflect.set(targetEuler, prop, 0, receiver);
      }
      return Reflect.set(targetEuler, prop, value, receiver);
    }
  });

  // Build the proxied target object
  const target: AnimationTarget = {
    camera: new Proxy(realTarget.camera, {
      get(targetObj, prop, receiver) {
        if (prop === 'position') {
          return proxiedCameraPosition;
        }
        return Reflect.get(targetObj, prop, receiver);
      }
    }),
    device: new Proxy(realTarget.device, {
      get(targetObj, prop, receiver) {
        if (prop === 'scale') {
          return proxiedDeviceScale;
        }
        if (prop === 'rotation') {
          return proxiedDeviceRotation;
        }
        return Reflect.get(targetObj, prop, receiver);
      }
    }),
    screenMesh: realTarget.screenMesh
  };

  // Look up the builder and invoke it
  const builder = builders[template];
  if (builder) {
    const duration = builder(tl, target, 'portrait', speed);
    return { timeline: tl, duration };
  }

  // Fallback for unknown templates
  return { timeline: tl, duration: 3 };
}
