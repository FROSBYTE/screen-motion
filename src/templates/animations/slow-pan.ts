import { AnimationBuilder } from './types';

export const buildSlowPan: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 5 / speed;
  const camZ = orientation === 'portrait' ? 4 : 4.5;
  const startX = -0.6;
  const endX = 0.6;

  target.camera.position.set(startX, 0, camZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(0, 0, orientation === 'portrait' ? 0 : -Math.PI / 2);

  tl.to(target.camera.position, {
    x: endX,
    duration: duration / 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: 1
  });

  const track = { t: 0 };
  tl.to(track, {
    t: 1,
    duration,
    ease: 'none',
    onUpdate: () => {
      target.camera.lookAt(0, 0, 0);
    }
  }, 0);

  return duration;
};
