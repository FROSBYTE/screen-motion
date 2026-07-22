import { AnimationBuilder } from './types';

export const buildDynamicShowcase: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 4.5 / speed;
  const isPortrait = orientation === 'portrait';
  const baseZ = isPortrait ? 4.0 : 4.6;

  target.camera.position.set(-2, 1, baseZ + 2);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(0.2, -0.4, 0);

  // Phase 1: Swoop in from angle
  tl.to(target.camera.position, {
    x: 0,
    y: 0,
    z: baseZ,
    duration: duration * 0.4,
    ease: 'power3.out',
    onUpdate: () => target.camera.lookAt(0, 0, 0),
  }, 0);

  tl.to(target.device.rotation, {
    x: 0,
    y: 0,
    duration: duration * 0.4,
    ease: 'power3.out',
  }, 0);

  // Phase 2: Elegant slow rotation tilt
  tl.to(target.device.rotation, {
    y: 0.2,
    x: -0.1,
    duration: duration * 0.3,
    ease: 'sine.inOut',
  }, duration * 0.4);

  // Phase 3: Settle back to center
  tl.to(target.device.rotation, {
    y: 0,
    x: 0,
    duration: duration * 0.3,
    ease: 'power2.inOut',
  }, duration * 0.7);

  return duration;
};
