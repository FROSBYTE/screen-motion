import * as THREE from 'three';
import { AnimationBuilder } from './types';

export const buildRevealZoom: AnimationBuilder = (tl, target, orientation, speed) => {
  const duration = 4 / speed;
  const startZ = orientation === 'portrait' ? 4.8 : 5.4;
  const endZ = orientation === 'portrait' ? 3.6 : 4.0;

  target.camera.position.set(0, 0, startZ);
  target.camera.lookAt(0, 0, 0);

  const baseZ = orientation === 'portrait' ? 0 : -Math.PI / 2;
  target.device.rotation.set(0.15, 0.2, baseZ);

  tl.to(target.camera.position, {
    z: endZ,
    duration: duration / 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: 1
  }, 0);

  tl.to(target.device.rotation, {
    x: 0,
    y: 0,
    duration: duration / 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: 1
  }, 0);

  if (target.screenMesh) {
    const mat = target.screenMesh.material as THREE.Material;
    mat.transparent = true;
    mat.opacity = 0;
    tl.to(mat, {
      opacity: 1,
      duration: duration * 0.3,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: 1
    }, duration * 0.1);
  }

  return duration;
};
