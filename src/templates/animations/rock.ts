import { AnimationBuilder } from './types';

export const buildRock: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 3.5 / speed;
  const isPortrait = orientation === 'portrait';
  const camZ = isPortrait ? 4 : 4.5;
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;
  const rockAxis = isPortrait ? 'z' : 'x';
  const rockAngle = 0.15;

  target.camera.position.set(0, 0, camZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(0, 0, baseRotZ);
  target.device.position.set(0, 0, 0);

  const seg = duration / 4;

  // Rock right
  tl.to(target.device.rotation, {
    [rockAxis]: baseRotZ + rockAngle,
    duration: seg,
    ease: 'sine.inOut',
  }, 0);

  // Rock left
  tl.to(target.device.rotation, {
    [rockAxis]: baseRotZ - rockAngle,
    duration: seg * 2,
    ease: 'sine.inOut',
  }, seg);

  // Return to center
  tl.to(target.device.rotation, {
    [rockAxis]: baseRotZ,
    duration: seg,
    ease: 'sine.inOut',
  }, seg * 3);

  // Gentle Y rotation throughout
  tl.to(target.device.rotation, {
    y: 0.1,
    duration: duration / 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: 1,
  }, 0);

  // Subtle vertical motion
  tl.to(target.device.position, {
    y: 0.08,
    duration: seg,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: 3,
  }, 0);

  return duration;
};
