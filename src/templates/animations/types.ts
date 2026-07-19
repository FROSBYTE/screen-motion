import * as THREE from 'three';

export interface AnimationTarget {
  camera: THREE.PerspectiveCamera;
  device: THREE.Group;
  screenMesh: THREE.Mesh | null;
}

export interface TemplateAnimation {
  timeline: gsap.core.Timeline;
  duration: number;
}

/**
 * Each animation module exports a function matching this signature.
 * It receives the GSAP timeline, proxied target, orientation, and speed,
 * and returns the animation duration.
 */
export type AnimationBuilder = (
  tl: gsap.core.Timeline,
  target: AnimationTarget,
  orientation: 'portrait' | 'landscape',
  speed: number
) => number;
