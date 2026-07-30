import { AnimationBuilder } from './types';
import { Orientation } from '@/types';

function getPerspectiveFloatConfig(orientation: Orientation) {
  if (orientation === 'portrait') {
    return {
      camStartZ: 4.2,
      rotX: 0.35,
      rotY: -0.5,
    };
  }
  return {
    camStartZ: 4.6,
    rotX: 0.35,
    rotY: -0.5,
  };
}

export const buildPerspectiveFloat: AnimationBuilder = (tl, target, orientation, speed) => {
  const cfg = getPerspectiveFloatConfig(orientation);
  const duration = 6.0 / speed;
  const baseRotZ = orientation === 'landscape' ? -Math.PI / 2 : 0;

  target.camera.position.set(0, 0, cfg.camStartZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(cfg.rotX, cfg.rotY, baseRotZ);

  // Smooth floating loop with subtle perspective tilt
  tl.to(
    target.device.position,
    {
      y: 0.2,
      duration: duration * 0.5,
      ease: 'sine.inOut',
    },
    0
  );
  tl.to(
    target.device.rotation,
    {
      y: cfg.rotY + 0.2,
      x: cfg.rotX - 0.1,
      duration: duration * 0.5,
      ease: 'sine.inOut',
    },
    0
  );

  tl.to(
    target.device.position,
    {
      y: -0.1,
      duration: duration * 0.5,
      ease: 'sine.inOut',
    },
    duration * 0.5
  );
  tl.to(
    target.device.rotation,
    {
      y: cfg.rotY,
      x: cfg.rotX,
      duration: duration * 0.5,
      ease: 'sine.inOut',
    },
    duration * 0.5
  );

  return duration;
};
