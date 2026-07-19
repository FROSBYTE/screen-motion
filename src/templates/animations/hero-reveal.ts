import { AnimationBuilder } from './types';
import { Orientation } from '@/types';

function getHeroRevealConfig(orientation: Orientation) {
  if (orientation === 'portrait') {
    return {
      cameraStartZ: 12,
      cameraEndZ: 3.5,
      deviceRotStart: -0.3,
      deviceRotEnd: 0.05,
      deviceRotZ: 0,
    };
  }
  return {
    cameraStartZ: 14,
    cameraEndZ: 4,
    deviceRotStart: -0.4,
    deviceRotEnd: 0.05,
    deviceRotZ: -Math.PI / 2,
  };
}

export const buildHeroReveal: AnimationBuilder = (tl, target, orientation, speed) => {
  const cfg = getHeroRevealConfig(orientation);
  const duration = 3.5 / speed;

  target.camera.position.set(0, 0, cfg.cameraStartZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(0, cfg.deviceRotStart, cfg.deviceRotZ);

  tl.to(
    target.camera.position,
    { z: cfg.cameraEndZ, duration: duration * 0.6, ease: 'power2.out' },
    0
  );

  tl.to(
    target.device.rotation,
    { y: cfg.deviceRotEnd, duration: duration * 0.6, ease: 'power2.out' },
    0
  );

  return duration;
};
