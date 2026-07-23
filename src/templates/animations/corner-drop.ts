import { AnimationBuilder } from './types';
import { Orientation } from '@/types';

function getCornerDropConfig(orientation: Orientation) {
  if (orientation === 'portrait') {
    return {
      camStartZ: 9,
      camEndZ: 4,
      rotXStart: -0.6,
      rotYStart: 0.5,
      rotXEnd: 0,
      rotYEnd: 0,
    };
  }
  return {
    camStartZ: 10,
    camEndZ: 4.5,
    rotXStart: -0.6,
    rotYStart: 0.5,
    rotXEnd: 0,
    rotYEnd: 0,
  };
}

export const buildCornerDrop: AnimationBuilder = (tl, target, orientation, speed) => {
  const cfg = getCornerDropConfig(orientation);
  const duration = 3.8 / speed;
  const baseRotZ = orientation === 'landscape' ? -Math.PI / 2 : 0;

  target.camera.position.set(0, 0, cfg.camStartZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(cfg.rotXStart, cfg.rotYStart, baseRotZ);

  // Dynamic swoop down and bounce-settle
  tl.to(
    target.camera.position,
    { z: cfg.camEndZ, duration: duration * 0.65, ease: 'back.out(1.4)' },
    0
  );

  tl.to(
    target.device.rotation,
    {
      x: cfg.rotXEnd,
      y: cfg.rotYEnd,
      duration: duration * 0.65,
      ease: 'back.out(1.4)',
    },
    0
  );

  // Subtle floating sway
  tl.to(
    target.device.rotation,
    {
      y: 0.08,
      duration: duration * 0.35,
      ease: 'sine.inOut',
    },
    duration * 0.65
  );

  return duration;
};
