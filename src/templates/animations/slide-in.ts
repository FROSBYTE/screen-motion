import { AnimationBuilder } from './types';

export const buildSlideIn: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 2.5 / speed;
  const isPortrait = orientation === 'portrait';
  const camZ = isPortrait ? 4 : 4.5;
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

  target.camera.position.set(0, 0, camZ);
  target.camera.lookAt(0, 0, 0);
  target.device.position.set(-5, 0, 0);
  target.device.rotation.set(0, -0.8, baseRotZ);

  // Slide from left to center and stay there
  tl.to(target.device.position, {
    x: 0,
    duration: duration * 0.5,
    ease: 'power3.out',
  }, 0);

  tl.to(target.device.rotation, {
    y: 0,
    duration: duration * 0.5,
    ease: 'power2.out',
  }, 0);

  return duration;
};
