import { AnimationBuilder } from './types';

export const buildCinematicPan: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 4.0 / speed;
  const isPortrait = orientation === 'portrait';
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

  const startX = -4;
  const endX = 0; // Panning comes into the screen/center only
  const camZ = isPortrait ? 3 : 3.5;
  const camYStart = isPortrait ? -0.5 : -0.3;
  const camYEnd = 0;

  target.camera.position.set(startX, camYStart, camZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(0, 0.4, baseRotZ);
  target.device.position.set(0, 0, 0);

  const panDuration = duration * 0.5;

  // 1. Pan from first side into screen/center
  tl.to(target.camera.position, {
    x: endX,
    y: camYEnd,
    duration: panDuration,
    ease: 'power2.out',
  }, 0);

  // Device counter-rotates straight to screen
  tl.to(target.device.rotation, {
    y: 0,
    duration: panDuration,
    ease: 'power2.out',
  }, 0);

  // Camera tracking
  const panProxy = { t: 0 };
  tl.to(panProxy, {
    t: 1,
    duration: panDuration,
    ease: 'none',
    onUpdate: () => {
      target.camera.lookAt(0, 0, 0);
    },
  }, 0);

  // 2. Hold straight on screen (removed second side animation)
  tl.to({}, { duration: duration * 0.5 }, panDuration);

  return duration;
};
