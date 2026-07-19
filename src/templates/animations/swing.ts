import { AnimationBuilder } from './types';

export const buildSwing: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 3 / speed;
  const isPortrait = orientation === 'portrait';
  const camZ = isPortrait ? 4.5 : 5;
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

  target.camera.position.set(0, 0, camZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(0, 0, baseRotZ);
  target.device.position.set(0, 0, 0);

  const swingAxis = isPortrait ? 'x' : 'y';
  const swingAngle = 0.6;

  // Swing forward
  tl.to(target.device.rotation, {
    [swingAxis]: swingAngle,
    duration: duration * 0.25,
    ease: 'power2.out',
  }, 0);

  // Swing back through center to other side
  tl.to(target.device.rotation, {
    [swingAxis]: -swingAngle * 0.7,
    duration: duration * 0.25,
    ease: 'power2.inOut',
  }, duration * 0.25);

  // Return with smaller swing
  tl.to(target.device.rotation, {
    [swingAxis]: swingAngle * 0.35,
    duration: duration * 0.2,
    ease: 'power2.inOut',
  }, duration * 0.5);

  // Settle back to center
  tl.to(target.device.rotation, {
    [swingAxis]: 0,
    duration: duration * 0.3,
    ease: 'elastic.out(1, 0.5)',
  }, duration * 0.7);

  // Camera tracks the motion slightly
  const camTrack = { offset: 0 };
  tl.to(camTrack, {
    offset: 1,
    duration: duration,
    ease: 'none',
    onUpdate: () => {
      const deviceRot = isPortrait
        ? target.device.rotation.x
        : target.device.rotation.y;
      target.camera.position.x = deviceRot * 0.8;
      target.camera.lookAt(0, 0, 0);
    },
  }, 0);

  return duration;
};
