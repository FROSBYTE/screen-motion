import { AnimationBuilder } from './types';

export const buildFloat: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 4 / speed;
  const isPortrait = orientation === 'portrait';
  const camZ = isPortrait ? 4 : 4.5;
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

  target.camera.position.set(0, 0, camZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(0, 0, baseRotZ);
  target.device.position.set(0, 0, 0);

  // Gentle vertical bob
  tl.to(target.device.position, {
    y: 0.25,
    duration: duration / 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: 1,
  }, 0);

  // Subtle tilt on X axis (breathing effect)
  tl.to(target.device.rotation, {
    x: 0.08,
    duration: duration / 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: 1,
  }, 0);

  // Very slow Y rotation (dreamy drift)
  tl.to(target.device.rotation, {
    y: 0.15,
    duration: duration / 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: 1,
  }, 0);

  // Camera subtle sway
  const camProxy = { sway: 0 };
  tl.to(camProxy, {
    sway: 1,
    duration: duration,
    ease: 'sine.inOut',
    onUpdate: () => {
      target.camera.position.x = Math.sin(camProxy.sway * Math.PI * 2) * 0.15;
      target.camera.lookAt(0, 0, 0);
    },
  }, 0);

  return duration;
};
