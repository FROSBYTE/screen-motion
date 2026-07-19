import { AnimationBuilder } from './types';

export const buildCarousel: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 4 / speed;
  const isPortrait = orientation === 'portrait';
  const radius = isPortrait ? 3.8 : 4.2;
  const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

  target.device.rotation.set(0, 0, baseRotZ);
  target.device.position.set(0, 0, 0);

  const proxy = { deviceAngle: 0, cameraAngle: 0, bobPhase: 0 };

  tl.to(proxy, {
    deviceAngle: Math.PI * 2,
    cameraAngle: Math.PI * 2,
    bobPhase: Math.PI * 4,
    duration,
    ease: 'none',
    onUpdate: () => {
      target.device.rotation.y = proxy.deviceAngle;
      target.device.rotation.z = baseRotZ;

      const camAngleOffset = Math.PI / 6;
      target.camera.position.x = Math.sin(proxy.cameraAngle + camAngleOffset) * radius;
      target.camera.position.z = Math.cos(proxy.cameraAngle + camAngleOffset) * radius;

      const camBaseY = isPortrait ? 0.5 : 0.2;
      target.camera.position.y = camBaseY + Math.sin(proxy.bobPhase) * 0.2;

      target.camera.lookAt(0, 0, 0);
    },
  }, 0);

  return duration;
};
