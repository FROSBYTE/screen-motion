import gsap from 'gsap';
import * as THREE from 'three';
import { TemplateName, Orientation } from '@/types';

export interface AnimationTarget {
  camera: THREE.PerspectiveCamera;
  device: THREE.Group;
  screenMesh: THREE.Mesh | null;
}

export interface TemplateAnimation {
  timeline: gsap.core.Timeline;
  duration: number;
}

// Get camera / device positions for each template + orientation
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

function getHeroRevealConfig(orientation: Orientation) {
  if (orientation === 'portrait') {
    return {
      cameraStartZ: 12,
      cameraEndZ: 3.5,
      cameraY: 0.5,
      deviceScaleStart: 0.6,
      deviceScaleEnd: 1,
      deviceRotStart: -0.3,
      deviceRotEnd: 0.05,
      deviceRotZ: 0,
    };
  }
  return {
    cameraStartZ: 14,
    cameraEndZ: 4,
    cameraY: 0,
    deviceScaleStart: 0.5,
    deviceScaleEnd: 1,
    deviceRotStart: -0.4,
    deviceRotEnd: 0.05,
    deviceRotZ: -Math.PI / 2,
  };
}

export function createAnimation(
  template: TemplateName,
  orientation: Orientation,
  target: AnimationTarget,
  speed: number
): TemplateAnimation {
  const tl = gsap.timeline({ paused: true });

  switch (template) {
    case 'orbit': {
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

      // Slow device rotation
      tl.to(
        target.device.rotation,
        { y: cfg.deviceRotation.y + Math.PI * 0.15, duration, ease: 'none' },
        0
      );

      return { timeline: tl, duration };
    }

    case 'spin': {
      const cfg = getSpinConfig(orientation);
      const duration = 2.5 / speed;

      // Set camera position
      target.camera.position.set(cfg.cameraPos.x, cfg.cameraPos.y, cfg.cameraPos.z);
      target.camera.lookAt(0, 0, 0);

      // Set base orientation
      target.device.rotation.z = cfg.deviceRotZ;
      target.device.rotation.y = cfg.deviceStartY;

      // Spin device 360
      tl.to(target.device.rotation, {
        y: cfg.deviceEndY,
        duration,
        ease: 'power1.inOut',
      });

      return { timeline: tl, duration };
    }

    case 'hero-reveal': {
      const cfg = getHeroRevealConfig(orientation);
      const duration = 3.5 / speed;

      // Initial state
      target.camera.position.set(0, cfg.cameraY, cfg.cameraStartZ);
      target.camera.lookAt(0, 0, 0);
      target.device.rotation.set(0, cfg.deviceRotStart, cfg.deviceRotZ);
      target.device.scale.setScalar(cfg.deviceScaleStart);

      // Camera zoom in
      tl.to(
        target.camera.position,
        { z: cfg.cameraEndZ, duration, ease: 'power2.out' },
        0
      );

      // Device scale up
      tl.to(
        target.device.scale,
        { x: cfg.deviceScaleEnd, y: cfg.deviceScaleEnd, z: cfg.deviceScaleEnd, duration: duration * 0.8, ease: 'back.out(1.4)' },
        0
      );

      // Device subtle rotation
      tl.to(
        target.device.rotation,
        { y: cfg.deviceRotEnd, duration: duration * 0.9, ease: 'power2.out' },
        0
      );

      // Screen fade-in effect
      if (target.screenMesh) {
        const mat = target.screenMesh.material as THREE.MeshStandardMaterial;
        if (mat.opacity !== undefined) {
          mat.transparent = true;
          mat.opacity = 0;
          tl.to(mat, { opacity: 1, duration: duration * 0.5, ease: 'power1.in' }, duration * 0.2);
        }
      }

      return { timeline: tl, duration };
    }

    case 'float': {
      const duration = 4 / speed;
      const isPortrait = orientation === 'portrait';
      const camZ = isPortrait ? 4 : 4.5;
      const camY = isPortrait ? 0.3 : 0;
      const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

      target.camera.position.set(0, camY, camZ);
      target.camera.lookAt(0, 0, 0);
      target.device.rotation.set(0, 0, baseRotZ);
      target.device.position.set(0, 0, 0);

      // Gentle vertical bob
      tl.to(target.device.position, {
        y: 0.25,
        duration: duration / 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1,
      }, 0);

      // Subtle tilt on X axis (breathing effect)
      tl.to(target.device.rotation, {
        x: 0.08,
        duration: duration / 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1,
      }, 0);

      // Very slow Y rotation (dreamy drift)
      tl.to(target.device.rotation, {
        y: 0.15,
        duration: duration,
        ease: 'sine.inOut',
        yoyo: true,
      }, 0);

      // Camera subtle sway
      const camProxy = { sway: 0 };
      tl.to(camProxy, {
        sway: 1,
        duration: duration,
        ease: 'sine.inOut',
        onUpdate: () => {
          target.camera.position.x = Math.sin(camProxy.sway * Math.PI * 2) * 0.15;
          target.camera.lookAt(0, 0, 0);
        },
      }, 0);

      return { timeline: tl, duration };
    }

    case 'showcase': {
      const duration = 5 / speed;
      const isPortrait = orientation === 'portrait';
      const camZ = isPortrait ? 3.8 : 4.2;
      const camY = isPortrait ? 0.3 : 0;
      const baseRotZ = isPortrait ? 0 : -Math.PI / 2;
      const seg = duration / 4; // 4 segments

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

      return { timeline: tl, duration };
    }

    case 'swing': {
      const duration = 3 / speed;
      const isPortrait = orientation === 'portrait';
      const camZ = isPortrait ? 4.5 : 5;
      const camY = isPortrait ? 1.5 : 0.8;
      const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

      // Camera from above to see the pendulum effect
      target.camera.position.set(0, camY, camZ);
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

      return { timeline: tl, duration };
    }

    case 'flip': {
      const duration = 2 / speed;
      const isPortrait = orientation === 'portrait';
      const camZ = isPortrait ? 4 : 4.5;
      const camY = isPortrait ? 0.3 : 0;
      const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

      target.camera.position.set(0, camY, camZ);
      target.camera.lookAt(0, 0, 0);
      target.device.rotation.set(0, Math.PI, baseRotZ); // Start showing back
      target.device.scale.setScalar(0.85);

      // Flip from back to front (Y rotation from PI to 0)
      tl.to(target.device.rotation, {
        y: 0,
        duration: duration * 0.7,
        ease: 'back.out(1.2)',
      }, duration * 0.15);

      // Scale up during flip
      tl.to(target.device.scale, {
        x: 1, y: 1, z: 1,
        duration: duration * 0.6,
        ease: 'power2.out',
      }, duration * 0.1);

      // Camera pulls back slightly then pushes in
      tl.to(target.camera.position, {
        z: camZ + 1,
        duration: duration * 0.3,
        ease: 'power1.in',
      }, 0);
      tl.to(target.camera.position, {
        z: camZ,
        duration: duration * 0.5,
        ease: 'power2.out',
      }, duration * 0.3);

      // Subtle X tilt for dramatic effect
      tl.to(target.device.rotation, {
        x: -0.08,
        duration: duration * 0.4,
        ease: 'power1.out',
      }, duration * 0.5);
      tl.to(target.device.rotation, {
        x: 0,
        duration: duration * 0.3,
        ease: 'sine.inOut',
      }, duration * 0.7);

      // Add a brief pause at the end to hold the final frame
      tl.to({}, { duration: duration * 0.15 });

      return { timeline: tl, duration };
    }

    case 'drift': {
      const duration = 4 / speed;
      const isPortrait = orientation === 'portrait';
      const camZ = isPortrait ? 3.8 : 4.2;
      const camY = isPortrait ? 0.3 : 0;
      const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

      target.camera.position.set(-2, camY, camZ);
      target.camera.lookAt(0, 0, 0);
      target.device.rotation.set(0, -0.2, baseRotZ);
      target.device.position.set(0, 0, 0);

      // Camera drifts from left to right
      tl.to(target.camera.position, {
        x: 2,
        duration,
        ease: 'power1.inOut',
      }, 0);

      // Device counter-rotates slightly for parallax
      tl.to(target.device.rotation, {
        y: 0.2,
        duration,
        ease: 'power1.inOut',
      }, 0);

      // Subtle vertical float
      tl.to(target.device.position, {
        y: 0.1,
        duration: duration / 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1,
      }, 0);

      // Camera always looks at device
      const driftProxy = { t: 0 };
      tl.to(driftProxy, {
        t: 1,
        duration,
        ease: 'none',
        onUpdate: () => {
          target.camera.lookAt(0, 0, 0);
        },
      }, 0);

      return { timeline: tl, duration };
    }

    case 'rise': {
      const duration = 3 / speed;
      const isPortrait = orientation === 'portrait';
      const camZ = isPortrait ? 4 : 4.5;
      const camY = isPortrait ? 0.3 : 0;
      const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

      target.camera.position.set(0, camY, camZ);
      target.camera.lookAt(0, 0, 0);
      target.device.position.set(0, -4, 0);
      target.device.rotation.set(0.3, 0, baseRotZ);
      target.device.scale.setScalar(0.7);

      // Rise up from below
      tl.to(target.device.position, {
        y: 0,
        duration: duration * 0.6,
        ease: 'power3.out',
      }, 0);

      // Scale up as it rises
      tl.to(target.device.scale, {
        x: 1, y: 1, z: 1,
        duration: duration * 0.5,
        ease: 'power2.out',
      }, duration * 0.1);

      // Straighten rotation
      tl.to(target.device.rotation, {
        x: 0,
        y: 0,
        duration: duration * 0.7,
        ease: 'power2.out',
      }, 0);

      // Subtle overshoot on Y position
      tl.to(target.device.position, {
        y: 0.08,
        duration: duration * 0.15,
        ease: 'sine.out',
      }, duration * 0.6);
      tl.to(target.device.position, {
        y: 0,
        duration: duration * 0.25,
        ease: 'sine.inOut',
      }, duration * 0.75);

      return { timeline: tl, duration };
    }

    case 'tilt-shift': {
      const duration = 4 / speed;
      const isPortrait = orientation === 'portrait';
      const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

      // Isometric-style camera angle
      target.camera.position.set(-2, 3, 4);
      target.camera.lookAt(0, 0, 0);
      target.device.rotation.set(0, 0.3, baseRotZ);

      // Slow dolly from left-above to right-above
      tl.to(target.camera.position, {
        x: 2,
        y: 2.5,
        duration,
        ease: 'power1.inOut',
      }, 0);

      // Subtle device rotation following camera
      tl.to(target.device.rotation, {
        y: -0.3,
        duration,
        ease: 'power1.inOut',
      }, 0);

      // Camera tracking
      const tiltProxy = { t: 0 };
      tl.to(tiltProxy, {
        t: 1,
        duration,
        ease: 'none',
        onUpdate: () => {
          target.camera.lookAt(0, 0, 0);
        },
      }, 0);

      return { timeline: tl, duration };
    }

    case 'carousel': {
      const duration = 4 / speed;
      const isPortrait = orientation === 'portrait';
      const radius = isPortrait ? 3.8 : 4.2;
      const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

      target.device.rotation.set(0, 0, baseRotZ);
      target.device.position.set(0, 0, 0);

      // Turntable: device rotates, camera orbits at slightly different speed
      const proxy = { deviceAngle: 0, cameraAngle: 0, bobPhase: 0 };

      tl.to(proxy, {
        deviceAngle: Math.PI * 2,
        cameraAngle: Math.PI * 2,
        bobPhase: Math.PI * 4,
        duration,
        ease: 'none',
        onUpdate: () => {
          // Device rotates on Y
          target.device.rotation.y = proxy.deviceAngle;
          target.device.rotation.z = baseRotZ;

          // Camera orbits but offset so it's not identical to orbit template
          const camAngleOffset = Math.PI / 6;
          target.camera.position.x = Math.sin(proxy.cameraAngle + camAngleOffset) * radius;
          target.camera.position.z = Math.cos(proxy.cameraAngle + camAngleOffset) * radius;

          // Camera bobs gently
          const camBaseY = isPortrait ? 0.5 : 0.2;
          target.camera.position.y = camBaseY + Math.sin(proxy.bobPhase) * 0.2;

          target.camera.lookAt(0, 0, 0);
        },
      }, 0);

      return { timeline: tl, duration };
    }

    case 'bounce-drop': {
      const duration = 2.5 / speed;
      const isPortrait = orientation === 'portrait';
      const camZ = isPortrait ? 4 : 4.5;
      const camY = isPortrait ? 0.5 : 0.2;
      const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

      target.camera.position.set(0, camY, camZ);
      target.camera.lookAt(0, 0, 0);
      target.device.position.set(0, 5, 0);
      target.device.rotation.set(0, 0.4, baseRotZ);
      target.device.scale.setScalar(0.9);

      // Drop down with gravity
      tl.to(target.device.position, {
        y: 0,
        duration: duration * 0.35,
        ease: 'bounce.out',
      }, 0);

      // Straighten rotation on landing
      tl.to(target.device.rotation, {
        y: 0,
        duration: duration * 0.5,
        ease: 'elastic.out(1, 0.4)',
      }, duration * 0.1);

      // Scale to full
      tl.to(target.device.scale, {
        x: 1, y: 1, z: 1,
        duration: duration * 0.3,
        ease: 'back.out(1.5)',
      }, duration * 0.2);

      // Slight squash on landing
      tl.to(target.device.scale, {
        y: 0.95, x: 1.03, z: 1.03,
        duration: duration * 0.06,
        ease: 'power2.in',
      }, duration * 0.33);
      tl.to(target.device.scale, {
        y: 1, x: 1, z: 1,
        duration: duration * 0.15,
        ease: 'elastic.out(1, 0.3)',
      }, duration * 0.39);

      // Hold at end
      tl.to({}, { duration: duration * 0.3 });

      return { timeline: tl, duration };
    }

    case 'slide-in': {
      const duration = 2.5 / speed;
      const isPortrait = orientation === 'portrait';
      const camZ = isPortrait ? 4 : 4.5;
      const camY = isPortrait ? 0.3 : 0;
      const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

      target.camera.position.set(0, camY, camZ);
      target.camera.lookAt(0, 0, 0);
      target.device.position.set(-5, 0, 0);
      target.device.rotation.set(0, -0.8, baseRotZ);
      target.device.scale.setScalar(0.8);

      // Slide from left to center
      tl.to(target.device.position, {
        x: 0,
        duration: duration * 0.6,
        ease: 'power3.out',
      }, 0);

      // Rotate to face forward
      tl.to(target.device.rotation, {
        y: 0,
        duration: duration * 0.7,
        ease: 'power2.out',
      }, 0);

      // Scale up
      tl.to(target.device.scale, {
        x: 1, y: 1, z: 1,
        duration: duration * 0.5,
        ease: 'power2.out',
      }, duration * 0.1);

      // Subtle overshoot on position
      tl.to(target.device.position, {
        x: 0.1,
        duration: duration * 0.12,
        ease: 'sine.out',
      }, duration * 0.6);
      tl.to(target.device.position, {
        x: 0,
        duration: duration * 0.28,
        ease: 'sine.inOut',
      }, duration * 0.72);

      return { timeline: tl, duration };
    }

    case 'zoom-pulse': {
      const duration = 3 / speed;
      const isPortrait = orientation === 'portrait';
      const camZBase = isPortrait ? 4 : 4.5;
      const camY = isPortrait ? 0.3 : 0;
      const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

      target.camera.position.set(0, camY, camZBase);
      target.camera.lookAt(0, 0, 0);
      target.device.rotation.set(0, 0, baseRotZ);

      const pulse = duration / 3; // 3 pulses

      // Pulse 1: zoom in
      tl.to(target.camera.position, {
        z: camZBase - 1.2,
        duration: pulse / 2,
        ease: 'power2.in',
      }, 0);
      tl.to(target.camera.position, {
        z: camZBase,
        duration: pulse / 2,
        ease: 'power2.out',
      }, pulse / 2);

      // Pulse 2: zoom in deeper with tilt
      tl.to(target.camera.position, {
        z: camZBase - 1.5,
        duration: pulse / 2,
        ease: 'power2.in',
      }, pulse);
      tl.to(target.camera.position, {
        z: camZBase,
        duration: pulse / 2,
        ease: 'power2.out',
      }, pulse * 1.5);
      tl.to(target.device.rotation, {
        y: 0.15,
        duration: pulse,
        ease: 'sine.inOut',
        yoyo: true,
      }, pulse);

      // Pulse 3: final zoom to close-up
      tl.to(target.camera.position, {
        z: camZBase - 1.8,
        duration: pulse / 2,
        ease: 'power3.in',
      }, pulse * 2);
      tl.to(target.camera.position, {
        z: camZBase,
        duration: pulse / 2,
        ease: 'power2.out',
      }, pulse * 2.5);

      // Gentle scale pulse throughout
      tl.to(target.device.scale, {
        x: 1.02, y: 1.02, z: 1.02,
        duration: pulse,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 2,
      }, 0);

      return { timeline: tl, duration };
    }

    case 'spiral': {
      const duration = 4 / speed;
      const isPortrait = orientation === 'portrait';
      const startRadius = isPortrait ? 7 : 8;
      const endRadius = isPortrait ? 3.5 : 4;
      const startY = isPortrait ? 3 : 2;
      const endY = isPortrait ? 0.3 : 0;
      const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

      target.device.rotation.set(0, 0, baseRotZ);
      target.device.position.set(0, 0, 0);
      target.camera.position.set(0, startY, startRadius);

      const proxy = { angle: 0, t: 0 };

      tl.to(proxy, {
        angle: Math.PI * 3, // 1.5 full rotations
        t: 1,
        duration,
        ease: 'power2.inOut',
        onUpdate: () => {
          const currentRadius = startRadius + (endRadius - startRadius) * proxy.t;
          const currentY = startY + (endY - startY) * proxy.t;

          target.camera.position.x = Math.sin(proxy.angle) * currentRadius;
          target.camera.position.z = Math.cos(proxy.angle) * currentRadius;
          target.camera.position.y = currentY;
          target.camera.lookAt(0, 0, 0);
        },
      }, 0);

      // Subtle device rotation responding to camera
      tl.to(target.device.rotation, {
        y: 0.2,
        duration: duration * 0.8,
        ease: 'power1.out',
      }, duration * 0.2);

      return { timeline: tl, duration };
    }

    case 'rock': {
      const duration = 3.5 / speed;
      const isPortrait = orientation === 'portrait';
      const camZ = isPortrait ? 4 : 4.5;
      const camY = isPortrait ? 0.3 : 0;
      const baseRotZ = isPortrait ? 0 : -Math.PI / 2;
      const rockAxis = isPortrait ? 'z' : 'x';
      const rockAngle = 0.15;

      target.camera.position.set(0, camY, camZ);
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

      return { timeline: tl, duration };
    }

    case 'cinematic-pan': {
      const duration = 4.5 / speed;
      const isPortrait = orientation === 'portrait';
      const baseRotZ = isPortrait ? 0 : -Math.PI / 2;

      // Start from far left, low angle
      const startX = -4;
      const endX = 4;
      const camZ = isPortrait ? 3 : 3.5;
      const camYStart = isPortrait ? -0.5 : -0.3;
      const camYEnd = isPortrait ? 0.8 : 0.5;

      target.camera.position.set(startX, camYStart, camZ);
      target.camera.lookAt(0, 0, 0);
      target.device.rotation.set(0, 0.4, baseRotZ);
      target.device.position.set(0, 0, 0);

      // Dolly from left to right
      tl.to(target.camera.position, {
        x: endX,
        duration,
        ease: 'power1.inOut',
      }, 0);

      // Camera rises during pan
      tl.to(target.camera.position, {
        y: camYEnd,
        duration,
        ease: 'sine.inOut',
      }, 0);

      // Device counter-rotates to maintain visual interest
      tl.to(target.device.rotation, {
        y: -0.4,
        duration,
        ease: 'power1.inOut',
      }, 0);

      // Subtle device tilt responding to camera height
      tl.to(target.device.rotation, {
        x: -0.1,
        duration: duration / 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1,
      }, 0);

      // Camera tracking
      const panProxy = { t: 0 };
      tl.to(panProxy, {
        t: 1,
        duration,
        ease: 'none',
        onUpdate: () => {
          target.camera.lookAt(0, 0, 0);
        },
      }, 0);

      return { timeline: tl, duration };
    }

    default:
      return { timeline: tl, duration: 3 };
  }
}
