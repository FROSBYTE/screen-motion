import { AnimationBuilder } from './types';

export const buildCinematicPan: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 4.5 / speed;
  const isPortrait = orientation === 'portrait';
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

  const startX = -4;
  const endX = 4;
  const camZ = isPortrait ? 3 : 3.5;
  const camYStart = isPortrait ? -0.5 : -0.3;
  const camYEnd = isPortrait ? 0.8 : 0.5;

  target.camera.position.set(startX, camYStart, camZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(0, 0.4, baseRotZ);
  target.device.position.set(0, 0, 0);

  // Dolly from left to right
  tl.to(target.camera.position, {
    x: endX,
    duration,
    ease: 'power1.inOut',
  }, 0);

  // Camera rises during pan
  tl.to(target.camera.position, {
    y: camYEnd,
    duration,
    ease: 'sine.inOut',
  }, 0);

  // Device counter-rotates to maintain visual interest
  tl.to(target.device.rotation, {
    y: -0.4,
    duration,
    ease: 'power1.inOut',
  }, 0);

  // Subtle device tilt responding to camera height
  tl.to(target.device.rotation, {
    x: -0.1,
    duration: duration / 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: 1,
  }, 0);

  // Camera tracking
  const panProxy = { t: 0 };
  tl.to(panProxy, {
    t: 1,
    duration,
    ease: 'none',
    onUpdate: () => {
      target.camera.lookAt(0, 0, 0);
    },
  }, 0);

  return duration;
};
