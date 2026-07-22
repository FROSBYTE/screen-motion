import { AnimationBuilder } from './types';

export const buildBounceDrop: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 3.5 / speed;
  const isPortrait = orientation === 'portrait';
  const camZ = isPortrait ? 4 : 4.5;
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

  target.camera.position.set(0, 0, camZ);
  target.camera.lookAt(0, 0, 0);
  target.device.position.set(0, 5, 0);
  target.device.rotation.set(0, 0.4, baseRotZ);

  // 1. Drop down cleanly to 0
  tl.to(target.device.position, {
    y: 0,
    duration: duration * 0.4,
    ease: 'power2.out',
  }, 0);

  // Rotate to align straight on screen
  tl.to(target.device.rotation, {
    y: 0,
    duration: duration * 0.4,
    ease: 'power2.out',
  }, 0);

  // 2. Settle cleanly at center (removed going up / bounce-up part)
  tl.to({}, { duration: duration * 0.6 }, duration * 0.4);

  return duration;
};
