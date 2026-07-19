import { AnimationBuilder } from './types';

export const buildFlip: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 2 / speed;
  const isPortrait = orientation === 'portrait';
  const camZ = isPortrait ? 4 : 4.5;
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

  target.camera.position.set(0, 0, camZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(0, Math.PI, baseRotZ);
  target.device.scale.setScalar(0.85);

  // Flip from back to front (Y rotation from PI to 0)
  tl.to(target.device.rotation, {
    y: 0,
    duration: duration * 0.7,
    ease: 'back.out(1.2)',
  }, duration * 0.15);

  // Scale up during flip
  tl.to(target.device.scale, {
    x: 1, y: 1, z: 1,
    duration: duration * 0.6,
    ease: 'power2.out',
  }, duration * 0.1);

  // Camera pulls back slightly then pushes in
  tl.to(target.camera.position, {
    z: camZ + 1,
    duration: duration * 0.3,
    ease: 'power1.in',
  }, 0);
  tl.to(target.camera.position, {
    z: camZ,
    duration: duration * 0.5,
    ease: 'power2.out',
  }, duration * 0.3);

  // Subtle X tilt for dramatic effect
  tl.to(target.device.rotation, {
    x: -0.08,
    duration: duration * 0.4,
    ease: 'power1.out',
  }, duration * 0.5);
  tl.to(target.device.rotation, {
    x: 0,
    duration: duration * 0.3,
    ease: 'sine.inOut',
  }, duration * 0.7);

  tl.to({}, { duration: duration * 0.15 });

  return duration;
};
