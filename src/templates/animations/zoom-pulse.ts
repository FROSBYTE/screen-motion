import { AnimationBuilder } from './types';
import { Orientation } from '@/types';

function getZoomPulseConfig(orientation: Orientation) {
  if (orientation === 'portrait') {
    return {
      camStartZ: 7.0,
      camPulseZ: 2.8,
      camEndZ: 4.0,
    };
  }
  return {
    camStartZ: 7.5,
    camPulseZ: 3.2,
    camEndZ: 4.5,
  };
}

export const buildZoomPulse: AnimationBuilder = (tl, target, orientation, speed) => {
  const cfg = getZoomPulseConfig(orientation);
  const duration = 4.5 / speed;
  const baseRotZ = orientation === 'landscape' ? -Math.PI / 2 : 0;

  target.camera.position.set(0, 0, cfg.camStartZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(0, 0, baseRotZ);

  // Phase 1: Fast zoom-in towards screen
  tl.to(
    target.camera.position,
    { z: cfg.camPulseZ, duration: duration * 0.4, ease: 'power3.inOut' },
    0
  );

  // Phase 2: Hold focus with slight rotation tilt
  tl.to(
    target.device.rotation,
    { y: 0.12, duration: duration * 0.3, ease: 'sine.inOut' },
    duration * 0.4
  );

  // Phase 3: Smooth pull-back into main hero position
  tl.to(
    target.camera.position,
    { z: cfg.camEndZ, duration: duration * 0.3, ease: 'power2.out' },
    duration * 0.7
  );
  tl.to(
    target.device.rotation,
    { y: 0, duration: duration * 0.3, ease: 'power2.out' },
    duration * 0.7
  );

  return duration;
};
