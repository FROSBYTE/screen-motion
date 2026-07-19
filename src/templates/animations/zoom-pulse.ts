import { AnimationBuilder } from './types';

export const buildZoomPulse: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 3 / speed;
  const isPortrait = orientation === 'portrait';
  const camZBase = isPortrait ? 4 : 4.5;
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

  target.camera.position.set(0, 0, camZBase);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(0, 0, baseRotZ);

  const pulse = duration / 3;

  // Pulse 1: zoom in
  tl.to(target.camera.position, {
    z: camZBase - 1.2,
    duration: pulse / 2,
    ease: 'power2.in',
  }, 0);
  tl.to(target.camera.position, {
    z: camZBase,
    duration: pulse / 2,
    ease: 'power2.out',
  }, pulse / 2);

  // Pulse 2: zoom in deeper with tilt
  tl.to(target.camera.position, {
    z: camZBase - 1.5,
    duration: pulse / 2,
    ease: 'power2.in',
  }, pulse);
  tl.to(target.camera.position, {
    z: camZBase,
    duration: pulse / 2,
    ease: 'power2.out',
  }, pulse * 1.5);
  tl.to(target.device.rotation, {
    y: 0.15,
    duration: pulse / 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: 1,
  }, pulse);

  // Pulse 3: final zoom to close-up
  tl.to(target.camera.position, {
    z: camZBase - 1.8,
    duration: pulse / 2,
    ease: 'power3.in',
  }, pulse * 2);
  tl.to(target.camera.position, {
    z: camZBase,
    duration: pulse / 2,
    ease: 'power2.out',
  }, pulse * 2.5);

  // Gentle scale pulse throughout
  tl.to(target.device.scale, {
    x: 1.02, y: 1.02, z: 1.02,
    duration: pulse,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: 2,
  }, 0);

  return duration;
};
