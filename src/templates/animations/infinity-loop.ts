import { AnimationBuilder } from './types';

export const buildInfinityLoop: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 5 / speed;
  const isPortrait = orientation === 'portrait';
  const camZ = isPortrait ? 4.2 : 4.8;

  target.camera.position.set(0, 0, camZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(0, 0, 0);

  const proxy = { progress: 0 };

  // Figure-8 infinity loop camera path with dynamic rotation
  tl.to(proxy, {
    progress: Math.PI * 2,
    duration,
    ease: 'none',
    onUpdate: () => {
      const t = proxy.progress;
      const scale = 1.2;
      target.camera.position.x = scale * Math.sin(t);
      target.camera.position.y = scale * Math.sin(t) * Math.cos(t) * 0.6;
      target.camera.position.z = camZ - Math.cos(t) * 0.4;
      target.camera.lookAt(0, 0, 0);

      // Subtle dynamic device tilt to match camera angle
      target.device.rotation.x = Math.sin(t * 2) * 0.08;
      target.device.rotation.y = Math.cos(t) * 0.18;
    },
  }, 0);

  return duration;
};
