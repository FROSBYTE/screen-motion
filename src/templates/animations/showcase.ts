import { AnimationBuilder } from './types';

export const buildShowcase: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 5 / speed;
  const isPortrait = orientation === 'portrait';
  const camZ = isPortrait ? 3.8 : 4.2;
  const camY = 0;
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;
  const seg = duration / 4;

  target.camera.position.set(0, camY, camZ);
  target.camera.lookAt(0, 0, 0);
  target.device.rotation.set(0, 0, baseRotZ);
  target.device.scale.setScalar(1);

  // Segment 1: Front view — slight tilt to show perspective
  tl.to(target.device.rotation, {
    x: 0.15,
    y: -0.3,
    duration: seg,
    ease: 'power2.inOut',
  }, 0);

  // Segment 2: Rotate to side view
  tl.to(target.device.rotation, {
    y: -Math.PI / 2 + 0.2,
    x: 0.05,
    duration: seg,
    ease: 'power2.inOut',
  }, seg);

  // Segment 3: Rotate to back view with camera dip
  tl.to(target.device.rotation, {
    y: -Math.PI + 0.1,
    x: -0.1,
    duration: seg,
    ease: 'power2.inOut',
  }, seg * 2);
  tl.to(target.camera.position, {
    y: camY - 0.3,
    duration: seg,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: 1,
  }, seg * 2);

  // Segment 4: Sweep back to front with flair
  tl.to(target.device.rotation, {
    y: -Math.PI * 2,
    x: 0,
    duration: seg,
    ease: 'power3.inOut',
  }, seg * 3);

  // Continuous gentle scale pulse
  tl.to(target.device.scale, {
    x: 1.03, y: 1.03, z: 1.03,
    duration: duration / 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: 1,
  }, 0);

  return duration;
};
