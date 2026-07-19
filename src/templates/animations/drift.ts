import { AnimationBuilder } from './types';

export const buildDrift: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 4 / speed;
  const isPortrait = orientation === 'portrait';
  const camZ = isPortrait ? 3.8 : 4.2;
  const camY = isPortrait ? 0.3 : 0;
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

  target.camera.position.set(-2, camY, camZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(0, -0.2, baseRotZ);
  target.device.position.set(0, 0, 0);

  // Camera drifts from left to right and returns
  tl.to(target.camera.position, {
    x: 2,
    duration: duration / 2,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: 1,
  }, 0);

  // Device counter-rotates slightly for parallax and returns
  tl.to(target.device.rotation, {
    y: 0.2,
    duration: duration / 2,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: 1,
  }, 0);

  // Subtle vertical float
  tl.to(target.device.position, {
    y: 0.1,
    duration: duration / 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: 1,
  }, 0);

  // Camera always looks at device
  const driftProxy = { t: 0 };
  tl.to(driftProxy, {
    t: 1,
    duration,
    ease: 'none',
    onUpdate: () => {
      target.camera.lookAt(0, 0, 0);
    },
  }, 0);

  return duration;
};
