import { AnimationBuilder } from './types';

export const buildDollyZoom: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 4.5 / speed;
  const startZ = orientation === 'portrait' ? 5.2 : 5.8;
  const endZ = orientation === 'portrait' ? 3.4 : 3.8;

  target.camera.position.set(0, 0, startZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(0.05, -0.1, orientation === 'portrait' ? 0 : -Math.PI / 2);

  tl.to(target.camera.position, {
    z: endZ,
    duration: duration / 2,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: 1
  });

  return duration;
};
