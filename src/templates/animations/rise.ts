import { AnimationBuilder } from './types';

export const buildRise: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 3 / speed;
  const isPortrait = orientation === 'portrait';
  const camZ = isPortrait ? 4 : 4.5;
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

  target.camera.position.set(0, 0, camZ);
  target.camera.lookAt(0, 0, 0);
  target.device.position.set(0, -4, 0);
  target.device.rotation.set(0.3, 0, baseRotZ);

  // Rise up to center
  tl.to(target.device.position, {
    y: 0,
    duration: duration * 0.6,
    ease: 'power3.out',
  }, 0);

  // Rotate to face forward and tilt back
  tl.to(target.device.rotation, {
    x: 0,
    y: 0,
    duration: duration * 0.6,
    ease: 'power2.out',
  }, 0);

  return duration;
};
