import { AnimationBuilder } from './types';

export const buildSpiral: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 4 / speed;
  const isPortrait = orientation === 'portrait';
  const startRadius = isPortrait ? 7 : 8;
  const endRadius = isPortrait ? 3.5 : 4;
  const startY = isPortrait ? 3 : 2;
  const endY = isPortrait ? 0.3 : 0;
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

  target.device.rotation.set(0, 0, baseRotZ);
  target.device.position.set(0, 0, 0);
  target.camera.position.set(0, startY, startRadius);

  const proxy = { angle: Math.PI, t: 0 };

  tl.to(proxy, {
    angle: Math.PI * 4,
    t: 1,
    duration,
    ease: 'power2.inOut',
    onUpdate: () => {
      const currentRadius = startRadius + (endRadius - startRadius) * proxy.t;
      const currentY = startY + (endY - startY) * proxy.t;

      target.camera.position.x = Math.sin(proxy.angle) * currentRadius;
      target.camera.position.z = Math.cos(proxy.angle) * currentRadius;
      target.camera.position.y = currentY;
      target.camera.lookAt(0, 0, 0);
    },
  }, 0);

  // Subtle device rotation responding to camera
  tl.to(target.device.rotation, {
    y: 0.2,
    duration: duration * 0.8,
    ease: 'power1.out',
  }, duration * 0.2);

  return duration;
};
