import { AnimationBuilder } from './types';

export const buildTiltShift: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 4 / speed;
  const isPortrait = orientation === 'portrait';
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

  target.camera.position.set(2, 3, 4);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(0, -0.3, baseRotZ);

  // Slow dolly from right-above to left-above
  tl.to(target.camera.position, {
    x: -2,
    y: 2.5,
    duration,
    ease: 'power1.inOut',
  }, 0);

  // Subtle device rotation following camera
  tl.to(target.device.rotation, {
    y: 0.3,
    duration,
    ease: 'power1.inOut',
  }, 0);

  // Camera tracking
  const tiltProxy = { t: 0 };
  tl.to(tiltProxy, {
    t: 1,
    duration,
    ease: 'none',
    onUpdate: () => {
      target.camera.lookAt(0, 0, 0);
    },
  }, 0);

  return duration;
};
