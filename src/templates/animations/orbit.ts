import { AnimationTarget, AnimationBuilder } from './types';
import { Orientation } from '@/types';

function getOrbitConfig(orientation: Orientation) {
  if (orientation === 'portrait') {
    return {
      cameraStart: { x: 0, y: 0, z: 4 },
      cameraRadius: 4,
      deviceRotation: { x: 0, y: 0, z: 0 },
      cameraY: 0.5,
    };
  }
  return {
    cameraStart: { x: 0, y: 0, z: 4.5 },
    cameraRadius: 4.5,
    deviceRotation: { x: 0, y: 0, z: -Math.PI / 2 },
    cameraY: 0,
  };
}

export const buildOrbit: AnimationBuilder = (tl, target, orientation, speed) => {
  const cfg = getOrbitConfig(orientation);
  const duration = 3 / speed;
  const proxy = { angle: 0 };

  // Set device rotation for orientation
  target.device.rotation.set(cfg.deviceRotation.x, cfg.deviceRotation.y, cfg.deviceRotation.z);

  // Animate camera orbiting around device
  tl.to(proxy, {
    angle: Math.PI * 2,
    duration,
    ease: 'none',
    onUpdate: () => {
      target.camera.position.x = Math.sin(proxy.angle) * cfg.cameraRadius;
      target.camera.position.z = Math.cos(proxy.angle) * cfg.cameraRadius;
      target.camera.position.y = cfg.cameraY;
      target.camera.lookAt(0, 0, 0);
    },
  });

  // Slow device rotation (oscillate back and forth to keep start and end centered)
  tl.to(
    target.device.rotation,
    { y: cfg.deviceRotation.y + Math.PI * 0.15, duration: duration / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 },
    0
  );

  return duration;
};
