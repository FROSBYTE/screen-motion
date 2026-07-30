import { AnimationBuilder } from './types';
import { Orientation } from '@/types';

function getSpinFlipConfig(orientation: Orientation) {
  if (orientation === 'portrait') {
    return {
      camStartZ: 5.5,
      camEndZ: 4.0,
      rotXStart: 0.3,
      rotYStart: -Math.PI * 2,
    };
  }
  return {
    camStartZ: 6.0,
    camEndZ: 4.5,
    rotXStart: 0.3,
    rotYStart: -Math.PI * 2,
  };
}

export const build3DSpinFlip: AnimationBuilder = (tl, target, orientation, speed) => {
  const cfg = getSpinFlipConfig(orientation);
  const duration = 4.0 / speed;
  const baseRotZ = orientation === 'landscape' ? -Math.PI / 2 : 0;

  target.camera.position.set(0, 0, cfg.camStartZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(cfg.rotXStart, cfg.rotYStart, baseRotZ);

  // Camera moves smoothly into position
  tl.to(
    target.camera.position,
    { z: cfg.camEndZ, duration: duration * 0.8, ease: 'power3.out' },
    0
  );

  // Elastic spin twist around Y axis
  tl.to(
    target.device.rotation,
    {
      x: 0,
      y: 0,
      duration: duration * 0.8,
      ease: 'back.out(1.4)',
    },
    0
  );

  // Subtle breathing bounce
  tl.to(
    target.camera.position,
    {
      z: cfg.camEndZ - 0.15,
      duration: duration * 0.2,
      ease: 'sine.inOut',
    },
    duration * 0.8
  );

  return duration;
};
