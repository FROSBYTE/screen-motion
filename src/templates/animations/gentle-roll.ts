import { AnimationBuilder } from './types';

export const buildGentleRoll: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 5 / speed;
  const camZ = orientation === 'portrait' ? 4 : 4.5;

  target.camera.position.set(0, 0, camZ);
  target.camera.lookAt(0, 0, 0);

  const baseZ = orientation === 'portrait' ? 0 : -Math.PI / 2;
  target.device.rotation.set(0, 0, baseZ);

  tl.to(target.device.rotation, {
    x: 0.12,
    y: -0.15,
    duration: duration / 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: 1
  });

  return duration;
};
