import { AnimationBuilder } from './types';
import { Orientation } from '@/types';

function getDepthZoomConfig(orientation: Orientation) {
  if (orientation === 'portrait') {
    return {
      camStartZ: 3.2,
      camMidZ: 5.5,
      camEndZ: 3.8,
      rotYStart: -0.4,
      rotYMid: 0.35,
      rotYEnd: 0,
      rotXStart: -0.15,
      rotXMid: 0.2,
      rotXEnd: 0,
    };
  }
  return {
    camStartZ: 3.6,
    camMidZ: 6.0,
    camEndZ: 4.2,
    rotYStart: -0.4,
    rotYMid: 0.35,
    rotYEnd: 0,
    rotXStart: -0.15,
    rotXMid: 0.2,
    rotXEnd: 0,
  };
}

export const buildDepthZoom: AnimationBuilder = (tl, target, orientation, speed) => {
  const cfg = getDepthZoomConfig(orientation);
  const duration = 4.5 / speed;
  const baseRotZ = orientation === 'landscape' ? -Math.PI / 2 : 0;

  target.camera.position.set(0, 0, cfg.camStartZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(cfg.rotXStart, cfg.rotYStart, baseRotZ);

  // Phase 1: Pull back while tilting Y/X
  tl.to(
    target.camera.position,
    { z: cfg.camMidZ, duration: duration * 0.5, ease: 'power2.inOut' },
    0
  );
  tl.to(
    target.device.rotation,
    {
      x: cfg.rotXMid,
      y: cfg.rotYMid,
      duration: duration * 0.5,
      ease: 'power2.inOut',
    },
    0
  );

  // Phase 2: Push forward smoothly into hero framing
  tl.to(
    target.camera.position,
    { z: cfg.camEndZ, duration: duration * 0.5, ease: 'power2.out' },
    duration * 0.5
  );
  tl.to(
    target.device.rotation,
    {
      x: cfg.rotXEnd,
      y: cfg.rotYEnd,
      duration: duration * 0.5,
      ease: 'power2.out',
    },
    duration * 0.5
  );

  return duration;
};
