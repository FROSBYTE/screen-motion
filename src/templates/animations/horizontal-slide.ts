import { AnimationBuilder } from './types';

export const buildHorizontalSlide: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 4.0 / speed;
  const isPortrait = orientation === 'portrait';
  const camZ = isPortrait ? 4 : 4.5;
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

  // Base camera position
  target.camera.position.set(0, 0, camZ);
  target.camera.lookAt(0, 0, 0);

  // Position starts at 5 (on the right) and slides to 0 (center)
  target.device.position.set(5, 0, 0);
  target.device.rotation.set(0, 0, baseRotZ);

  // Slide from right to center and stay there
  tl.to(target.device.position, {
    x: 0,
    duration: duration * 0.5,
    ease: 'power3.out',
  }, 0);

  return duration;
};
