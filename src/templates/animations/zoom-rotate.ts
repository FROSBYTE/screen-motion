import { AnimationBuilder } from './types';

export const buildZoomRotate: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 4.0 / speed;
  const isPortrait = orientation === 'portrait';
  
  // Set up camera and target positions
  const camZStart = isPortrait ? 8.0 : 9.0;
  const camZEnd = isPortrait ? 2.25 : 2.65;
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

  // Distant tilted starting perspective
  const startRotX = 0.45;
  const startRotY = -0.55;
  const startRotZ = baseRotZ + 0.15;

  target.camera.position.set(0, 0, camZStart);
  target.camera.lookAt(0, 0, 0);
  
  target.device.position.set(0, 0, 0);
  target.device.rotation.set(startRotX, startRotY, startRotZ);

  // Phases:
  // 40% rapid zoom-in and rotate
  // 60% hold at centered full-frame view
  const zoomInDuration = duration * 0.40;
  const holdDuration = duration * 0.60;

  // Phase 1: Rapid zoom-in & align straight-on
  tl.to(target.camera.position, {
    z: camZEnd,
    duration: zoomInDuration,
    ease: 'power3.inOut',
  }, 0);

  tl.to(target.device.rotation, {
    x: 0,
    y: 0,
    z: baseRotZ,
    duration: zoomInDuration,
    ease: 'power3.inOut',
  }, 0);

  // Phase 2: Hold (locked centered full-frame view)
  tl.to({}, { duration: holdDuration }, zoomInDuration);

  return duration;
};
