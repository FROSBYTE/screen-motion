import { AnimationBuilder } from './types';
import { Orientation } from '@/types';

function getSpinConfig(orientation: Orientation) {
  if (orientation === 'portrait') {
    return {
      cameraPos: { x: 0, y: 0.3, z: 3.5 },
      deviceStartY: 0,
      deviceEndY: Math.PI * 2,
      deviceRotZ: 0,
    };
  }
  return {
    cameraPos: { x: 0, y: 0, z: 4 },
    deviceStartY: 0,
    deviceEndY: Math.PI * 2,
    deviceRotZ: -Math.PI / 2,
  };
}

export const buildSpin: AnimationBuilder = (tl, target, orientation, speed) => {
  const cfg = getSpinConfig(orientation);
  const duration = 2.5 / speed;

  target.camera.position.set(cfg.cameraPos.x, cfg.cameraPos.y, cfg.cameraPos.z);
  target.camera.lookAt(0, 0, 0);

  target.device.rotation.z = cfg.deviceRotZ;
  target.device.rotation.y = cfg.deviceStartY;

  tl.to(target.device.rotation, {
    y: cfg.deviceEndY,
    duration,
    ease: 'power1.inOut',
  });

  return duration;
};
