import { AnimationTarget, AnimationBuilder } from './types';
import { Orientation } from '@/types';

export const buildOrbit: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 3.5 / speed;
  const isPortrait = orientation === 'portrait';
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

  target.camera.position.set(0, 0, 4);
  target.camera.lookAt(0, 0, 0);

  target.device.position.set(0, 0, 0);
  target.device.rotation.set(0.12, 0, baseRotZ);

  // Full 360-degree orbit rotation directly around the device's own vertical center axis
  tl.to(
    target.device.rotation,
    {
      y: Math.PI * 2,
      duration,
      ease: 'none',
    },
    0
  );

  // Subtle 3D dynamic elevation tilt during orbit for realism
  tl.to(
    target.device.rotation,
    {
      x: -0.12,
      duration: duration / 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1,
    },
    0
  );

  return duration;
};
