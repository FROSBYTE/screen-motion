import { AnimationBuilder } from './types';

export const buildBounceDrop: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 3.8 / speed;
  const isPortrait = orientation === 'portrait';
  const camZ = isPortrait ? 4 : 4.5;
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

  target.camera.position.set(0, 0, camZ);
  target.camera.lookAt(0, 0, 0);
  target.device.position.set(0, 5, 0);
  target.device.rotation.set(0, 0.4, baseRotZ);

  // 1. Drop down to 0
  tl.to(target.device.position, {
    y: 0,
    duration: duration * 0.35,
    ease: 'power2.in',
  }, 0);

  // 2. Bounce up slightly (dampened, single bounce)
  tl.to(target.device.position, {
    y: 0.25,
    duration: duration * 0.12,
    ease: 'power1.out',
  }, duration * 0.35);

  // 3. Fall back to 0
  tl.to(target.device.position, {
    y: 0,
    duration: duration * 0.12,
    ease: 'power1.in',
  }, duration * 0.47);

  // Rotate to align to center
  tl.to(target.device.rotation, {
    y: 0,
    duration: duration * 0.4,
    ease: 'power2.out',
  }, duration * 0.1);

  // Hold at center
  tl.to({}, { duration: duration * 0.15 }, duration * 0.59);

  // 4. Return back up to start position (loop seamlessly)
  tl.to(target.device.position, {
    y: 5,
    duration: duration * 0.26,
    ease: 'power2.in',
  }, duration * 0.74);

  tl.to(target.device.rotation, {
    y: 0.4,
    duration: duration * 0.26,
    ease: 'power2.in',
  }, duration * 0.74);

  return duration;
};
