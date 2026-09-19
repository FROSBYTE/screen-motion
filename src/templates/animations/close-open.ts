import { AnimationBuilder } from './types';
import { Orientation } from '@/types';

function getCloseOpenConfig(orientation: Orientation) {
  if (orientation === 'portrait') {
    return {
      camStartZ: 4.4,
      camEndZ: 4.6,
      rotYStart: 0.25,
      rotYEnd: -0.15,
      rotXStart: 0.05,
      rotXEnd: 0,
      baseRotZ: 0,
    };
  }
  return {
    camStartZ: 4.4,
    camEndZ: 4.8,
    rotYStart: 0.3,
    rotYEnd: -0.1,
    rotXStart: 0.08,
    rotXEnd: 0,
    baseRotZ: 0,
  };
}

export const buildCloseOpen: AnimationBuilder = (tl, target, orientation, speed) => {
  const cfg = getCloseOpenConfig(orientation);
  const duration = 4.5 / speed;

  // Initialize camera & device position
  target.camera.position.set(0, 0, cfg.camStartZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(cfg.rotXStart, cfg.rotYStart, cfg.baseRotZ);

  // Fold animation: Closed (1 / 0°) -> Open (0 / 180°)
  target.device.userData.foldProgress = 1;
  tl.to(
    target.device.userData,
    {
      foldProgress: 0,
      duration: duration * 0.75,
      ease: 'power2.inOut',
    },
    duration * 0.1
  );

  // Smooth cinematic camera move and rotation during unfold
  tl.to(
    target.camera.position,
    {
      z: cfg.camEndZ,
      duration: duration * 0.5,
      ease: 'power2.out',
    },
    0
  );

  tl.to(
    target.device.rotation,
    {
      y: cfg.rotYEnd,
      x: cfg.rotXEnd,
      duration: duration * 0.5,
      ease: 'power2.inOut',
    },
    0
  );

  // Hold focus on the opened display and then settle gracefully
  tl.to(
    target.camera.position,
    {
      z: cfg.camStartZ,
      duration: duration * 0.5,
      ease: 'power2.inOut',
    },
    duration * 0.5
  );

  tl.to(
    target.device.rotation,
    {
      y: 0,
      x: 0,
      duration: duration * 0.5,
      ease: 'power2.out',
    },
    duration * 0.5
  );

  return duration;
};
