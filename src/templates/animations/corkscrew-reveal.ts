import { AnimationBuilder } from './types';
import { Orientation } from '@/types';

function getCorkscrewConfig(orientation: Orientation) {
  if (orientation === 'portrait') {
    return {
      cameraStartZ: 14,
      cameraEndZ: 4,
      rotXStart: Math.PI / 4,
      rotYStart: -Math.PI * 1.5,
      rotZStart: -Math.PI / 6,
      rotXEnd: 0,
      rotYEnd: 0,
      rotZEnd: 0,
    };
  }
  return {
    cameraStartZ: 16,
    cameraEndZ: 4.5,
    rotXStart: Math.PI / 4,
    rotYStart: -Math.PI * 1.5,
    rotZStart: -Math.PI / 2,
    rotXEnd: 0,
    rotYEnd: 0,
    rotZEnd: -Math.PI / 2,
  };
}

export const buildCorkscrewReveal: AnimationBuilder = (tl, target, orientation, speed) => {
  const cfg = getCorkscrewConfig(orientation);
  const duration = 4.0 / speed;

  target.camera.position.set(0, 0, cfg.cameraStartZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(cfg.rotXStart, cfg.rotYStart, cfg.rotZStart);

  // Camera zoom in with powerful smooth curve
  tl.to(
    target.camera.position,
    { z: cfg.cameraEndZ, duration: duration * 0.7, ease: 'power3.out' },
    0
  );

  // Smooth multi-axis rotation unroll
  tl.to(
    target.device.rotation,
    {
      x: cfg.rotXEnd,
      y: cfg.rotYEnd,
      z: cfg.rotZEnd,
      duration: duration * 0.8,
      ease: 'power3.out',
    },
    0
  );

  // Subtle settle hover at the end
  tl.to(
    target.device.rotation,
    {
      y: cfg.rotYEnd + 0.08,
      duration: duration * 0.2,
      ease: 'sine.inOut',
    },
    duration * 0.8
  );

  return duration;
};
