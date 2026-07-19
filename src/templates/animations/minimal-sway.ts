import { AnimationBuilder } from './types';

export const buildMinimalSway: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 4 / speed;
  const camZ = orientation === 'portrait' ? 4 : 4.5;

  target.camera.position.set(0, 0, camZ);
  target.camera.lookAt(0, 0, 0);

  const baseZ = orientation === 'portrait' ? 0 : -Math.PI / 2;
  target.device.rotation.set(0.1, -0.15, baseZ);

  tl.to(target.device.rotation, {
    y: 0.15,
    x: -0.1,
    duration: duration / 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: 1
  });

  return duration;
};
