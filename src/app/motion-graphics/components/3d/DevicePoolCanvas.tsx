'use client';

import React, { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { createAnimation, AnimationTarget, TemplateAnimation } from '@/templates/animations';
import type { TemplateName } from '@/types';
import { MGLayer, MGComponentLayer } from '../../store';

// iPhone & Android screen mesh identifiers
const IPHONE_SCREEN_MESH = 'Object_18';
const ANDROID_SCREEN_MESH = 'S22_Ultra001_2';

export interface ActiveDeviceDescriptor {
  layer: MGLayer;
  sceneId: string;
  localTime: number;
  isOutgoing?: boolean;
  transitionOpacity?: number;
  transitionTransform?: string;
  transitionClipPath?: string;
}

const POOL_SIZE = 3;
const DEFAULT_PLACEHOLDER_URL = '/Drag_And_Drop.png';

// Global Texture Cache for static images
const globalImageTextureCache = new Map<string, THREE.Texture>();
const textureLoader = new THREE.TextureLoader();

function getOrCreateImageTexture(url: string, onLoad?: (tex: THREE.Texture) => void): THREE.Texture {
  const targetUrl = (url && url.trim() !== '') ? url : DEFAULT_PLACEHOLDER_URL;
  if (globalImageTextureCache.has(targetUrl)) {
    const cached = globalImageTextureCache.get(targetUrl)!;
    if (onLoad && cached.image) onLoad(cached);
    return cached;
  }

  const tex = textureLoader.load(
    targetUrl,
    (loadedTex) => {
      loadedTex.colorSpace = THREE.SRGBColorSpace;
      loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
      loadedTex.magFilter = THREE.LinearFilter;
      loadedTex.generateMipmaps = true;
      loadedTex.anisotropy = 16;
      loadedTex.flipY = true;
      loadedTex.needsUpdate = true;
      globalImageTextureCache.set(targetUrl, loadedTex);
      if (onLoad) onLoad(loadedTex);
    },
    undefined,
    () => {
      // Fallback
      if (targetUrl !== DEFAULT_PLACEHOLDER_URL) {
        getOrCreateImageTexture(DEFAULT_PLACEHOLDER_URL, onLoad);
      }
    }
  );
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 16;
  tex.flipY = true;
  globalImageTextureCache.set(targetUrl, tex);
  return tex;
}

// ─────────────────────────────────────────────────────────────
// Pooled iPhone Model Sub-hierarchy
// ─────────────────────────────────────────────────────────────
function PooledIPhoneModel({
  deviceColor,
  screenTexture,
  visible,
}: {
  deviceColor: string;
  screenTexture: THREE.Texture | null;
  visible: boolean;
}) {
  const { scene } = useGLTF('/models/iphone16.gltf') as any;
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const initialColors = useRef<Record<string, THREE.Color>>({});
  const uvFixed = useRef(false);
  const screenMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);

  // Compute static center offset synchronously on mount (replaces <Center> to avoid pivot drift)
  const centerOffset = useMemo<[number, number, number]>(() => {
    cloned.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    if (isFinite(center.x) && isFinite(center.y) && isFinite(center.z)) {
      return [-center.x, -center.y, -center.z];
    }
    return [0, 0, 0];
  }, [cloned]);

  useEffect(() => {
    if (Object.keys(initialColors.current).length === 0) {
      cloned.traverse((child: any) => {
        if (!child.isMesh) return;
        child.renderOrder = child.name === IPHONE_SCREEN_MESH ? 10 : 0;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat: any) => {
          if (mat) {
            if (mat.color && !initialColors.current[mat.uuid]) {
              initialColors.current[mat.uuid] = mat.color.clone();
            }
          }
        });
      });
    }
  }, [cloned]);

  useEffect(() => {
    if (uvFixed.current) return;
    const screenMesh = cloned.getObjectByName(IPHONE_SCREEN_MESH) as THREE.Mesh | null;
    if (!screenMesh) return;
    const geometry = screenMesh.geometry;
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) return;

    const posAttr = geometry.attributes.position;
    const uvAttr = geometry.attributes.uv;
    if (!posAttr || !uvAttr) return;

    const minX = box.min.x;
    const maxX = box.max.x;
    const minY = box.min.y;
    const maxY = box.max.y;
    const width = maxX - minX;
    const height = maxY - minY;

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      uvAttr.setXY(i, (x - minX) / width, (y - minY) / height);
    }
    uvAttr.needsUpdate = true;
    uvFixed.current = true;
  }, [cloned]);

  // Update body colors
  useEffect(() => {
    if (!visible) return;
    cloned.traverse((child: any) => {
      if (!child.isMesh) return;
      if (child.name === IPHONE_SCREEN_MESH) return;

      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat: any) => {
        if (!mat || !mat.color) return;
        if (mat.name === 'Display_ActiveArea' || mat.name === 'Screen' || mat.name === 'Object_18') return;
        if (mat.emissive && (mat.emissive.r > 0.2 || mat.emissive.g > 0.2)) return;

        const initial = initialColors.current[mat.uuid];
        const name = (mat.name || '').toLowerCase();
        const isNotchOrLens =
          (initial && initial.r < 0.12 && initial.g < 0.12 && initial.b < 0.12) ||
          mat.name === 'Lens_Glass' ||
          mat.name === 'Flash' ||
          name.includes('notch') ||
          name.includes('island') ||
          name.includes('hole') ||
          name.includes('camera') ||
          name.includes('lens') ||
          name.includes('sensor') ||
          name.includes('speaker') ||
          name.includes('bezel');

        if (isNotchOrLens) {
          mat.color.set('#000000');
          if (mat.map) mat.map = null;
        } else {
          mat.color.set(deviceColor);
          if (mat.map) mat.map = null;
        }
        mat.needsUpdate = true;
      });
    });
  }, [deviceColor, cloned, visible]);

  // Initialize screen material with placeholder on mount
  useEffect(() => {
    const screenMesh = cloned.getObjectByName(IPHONE_SCREEN_MESH) as THREE.Mesh | null;
    if (screenMesh && !screenMaterialRef.current) {
      const defaultTex = getOrCreateImageTexture(DEFAULT_PLACEHOLDER_URL);
      screenMaterialRef.current = new THREE.MeshBasicMaterial({
        map: defaultTex,
        toneMapped: false,
        transparent: false,
        depthWrite: true,
        depthTest: true,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
      screenMesh.material = screenMaterialRef.current;
      screenMesh.renderOrder = 10;
    }
  }, [cloned]);

  // Apply screen texture
  useEffect(() => {
    if (!visible) return;
    const screenMesh = cloned.getObjectByName(IPHONE_SCREEN_MESH) as THREE.Mesh | null;
    if (!screenMesh) return;

    if (!screenMaterialRef.current) {
      screenMaterialRef.current = new THREE.MeshBasicMaterial({
        toneMapped: false,
        transparent: false,
        depthWrite: true,
        depthTest: true,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
      screenMesh.material = screenMaterialRef.current;
      screenMesh.renderOrder = 10;
    }

    const texToApply = screenTexture || getOrCreateImageTexture(DEFAULT_PLACEHOLDER_URL);
    if (texToApply) {
      texToApply.needsUpdate = true;
      screenMaterialRef.current.map = texToApply;
      screenMaterialRef.current.needsUpdate = true;
    }
  }, [screenTexture, cloned, visible]);

  return (
    <group visible={visible}>
      <group position={centerOffset}>
        <primitive object={cloned} />
      </group>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// Pooled Android Model Sub-hierarchy
// ─────────────────────────────────────────────────────────────
function PooledAndroidModel({
  deviceColor,
  screenTexture,
  visible,
}: {
  deviceColor: string;
  screenTexture: THREE.Texture | null;
  visible: boolean;
}) {
  const { scene } = useGLTF('/models/S22Ultra.glb') as any;
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const uvFixed = useRef(false);
  const screenMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);

  // Compute static center offset synchronously on mount (replaces <Center> to avoid pivot drift)
  const centerOffset = useMemo<[number, number, number]>(() => {
    const wrapper = new THREE.Group();
    const innerGroup = new THREE.Group();
    innerGroup.position.set(0, -7.3704, 0);
    innerGroup.scale.setScalar(88.58);
    innerGroup.add(cloned);
    wrapper.add(innerGroup);
    wrapper.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(wrapper);
    const center = box.getCenter(new THREE.Vector3());
    // Clean up temporary wrapper
    innerGroup.remove(cloned);
    wrapper.remove(innerGroup);
    if (isFinite(center.x) && isFinite(center.y) && isFinite(center.z)) {
      return [-center.x, -center.y, -center.z];
    }
    return [0, 0, 0];
  }, [cloned]);

  useEffect(() => {
    if (uvFixed.current) return;
    const screenMesh = cloned.getObjectByName(ANDROID_SCREEN_MESH) as THREE.Mesh | null;
    if (!screenMesh) return;

    const geo = screenMesh.geometry;
    geo.computeBoundingBox();
    const box = geo.boundingBox;
    if (!box) return;

    const width = box.max.x - box.min.x;
    const height = box.max.y - box.min.y;
    const minX = box.min.x;
    const minY = box.min.y;

    const posAttr = geo.attributes.position;
    const uvAttr = geo.attributes.uv;
    if (!posAttr || !uvAttr) return;

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      uvAttr.setXY(i, (x - minX) / width, (y - minY) / height);
    }
    uvAttr.needsUpdate = true;
    uvFixed.current = true;

    cloned.traverse((child: any) => {
      if (!child.isMesh) return;
      child.renderOrder = child.name === ANDROID_SCREEN_MESH ? 10 : 0;
    });
  }, [cloned]);

  // Update body colors
  useEffect(() => {
    if (!visible) return;
    cloned.traverse((child: any) => {
      if (!child.isMesh) return;
      if (child.name === ANDROID_SCREEN_MESH) return;

      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat: any) => {
        if (!mat || !mat.color) return;
        if (mat.name === 'Display_ActiveArea' || mat.name === 'Screen' || mat.name === 'S22_Ultra001_2') return;
        if (mat.emissive && (mat.emissive.r > 0.2 || mat.emissive.g > 0.2)) return;

        const isBodyOrBack =
          mat.name === 'Rearcase' ||
          mat.name === 'Back_Cover_Glass' ||
          mat.name === 'BackCamDeco' ||
          mat.name === 'Cam_Body';

        if (isBodyOrBack) {
          mat.color.set(deviceColor);
          if (mat.map) mat.map = null;
        } else {
          mat.color.set('#000000');
          if (mat.map) mat.map = null;
        }
        mat.needsUpdate = true;
      });
    });
  }, [deviceColor, cloned, visible]);

  // Initialize screen material with placeholder on mount
  useEffect(() => {
    const screenMesh = cloned.getObjectByName(ANDROID_SCREEN_MESH) as THREE.Mesh | null;
    if (screenMesh && !screenMaterialRef.current) {
      const defaultTex = getOrCreateImageTexture(DEFAULT_PLACEHOLDER_URL);
      screenMaterialRef.current = new THREE.MeshBasicMaterial({
        map: defaultTex,
        toneMapped: false,
        transparent: false,
        depthWrite: true,
        depthTest: true,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
      screenMesh.material = screenMaterialRef.current;
      screenMesh.renderOrder = 10;
    }
  }, [cloned]);

  // Apply screen texture
  useEffect(() => {
    if (!visible) return;
    const screenMesh = cloned.getObjectByName(ANDROID_SCREEN_MESH) as THREE.Mesh | null;
    if (!screenMesh) return;

    if (!screenMaterialRef.current) {
      screenMaterialRef.current = new THREE.MeshBasicMaterial({
        toneMapped: false,
        transparent: false,
        depthWrite: true,
        depthTest: true,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
      screenMesh.material = screenMaterialRef.current;
      screenMesh.renderOrder = 10;
    }

    const texToApply = screenTexture || getOrCreateImageTexture(DEFAULT_PLACEHOLDER_URL);
    if (texToApply) {
      texToApply.needsUpdate = true;
      screenMaterialRef.current.map = texToApply;
      screenMaterialRef.current.needsUpdate = true;
    }
  }, [screenTexture, cloned, visible]);

  return (
    <group visible={visible}>
      <group position={centerOffset}>
        <group position={[0, -7.3704, 0]} scale={88.58}>
          <primitive object={cloned} />
        </group>
      </group>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// Single Pooled 3D Device Slot
// ─────────────────────────────────────────────────────────────
function PooledDeviceSlot({
  slotIndex,
  descriptor,
}: {
  slotIndex: number;
  descriptor?: ActiveDeviceDescriptor | null;
}) {
  const slotGroupRef = useRef<THREE.Group>(null!);
  const camCompGroupRef = useRef<THREE.Group>(null!);
  const deviceAnimGroupRef = useRef<THREE.Group>(null!);
  const deviceTransformGroupRef = useRef<THREE.Group>(null!);
  const animRef = useRef<TemplateAnimation | null>(null);
  const virtualCameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Persistent reusable Video element & VideoTexture per slot
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const videoTextureRef = useRef<THREE.VideoTexture | null>(null);
  const [activeScreenTexture, setActiveScreenTexture] = useState<THREE.Texture | null>(() => {
    return getOrCreateImageTexture(DEFAULT_PLACEHOLDER_URL);
  });

  const isSlotActive = Boolean(descriptor && descriptor.layer && descriptor.layer.type === 'component');
  const compLayer = descriptor?.layer?.type === 'component' ? (descriptor.layer as MGComponentLayer) : null;
  const deviceType = (compLayer?.props?.deviceType || 'iphone') as 'iphone' | 'android';
  const deviceColor = compLayer?.props?.deviceColor || '#1a1a1a';
  const screenImage = compLayer?.props?.screenImage;
  const screenVideo = compLayer?.props?.screenVideo;
  const animationTemplate = (compLayer?.props?.animationTemplate || 'float') as TemplateName;
  const layerDuration = Math.max(0.3, compLayer?.duration || 3.0);
  const pacingPreset = compLayer?.pacingPreset || 'balanced';
  // Scale speed dynamically so the template animation duration directly matches the layer's timeline duration
  const pacingMultiplier = pacingPreset === 'snappy' ? 1.5 : pacingPreset === 'cinematic' ? 1.0 : 1.0;
  const speed = (3.5 / layerDuration) * pacingMultiplier;
  const deviceSize = compLayer?.props?.deviceSize ?? compLayer?.props?.size ?? compLayer?.scale ?? 1;
  const posX = compLayer?.props?.posX ?? 0;
  const posY = compLayer?.props?.posY ?? 0;
  const rotX = compLayer?.props?.rotX ?? 0;
  const rotY = compLayer?.props?.rotY ?? 0;
  const rotZ = compLayer?.props?.rotZ ?? 0;
  const localTime = descriptor && compLayer ? descriptor.localTime - compLayer.startTime : 0;

  // Initialize persistent video element & texture once per slot
  useEffect(() => {
    const v = document.createElement('video');
    v.crossOrigin = 'anonymous';
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    videoElRef.current = v;

    const vt = new THREE.VideoTexture(v);
    vt.colorSpace = THREE.SRGBColorSpace;
    vt.minFilter = THREE.LinearFilter;
    vt.magFilter = THREE.LinearFilter;
    vt.flipY = true;
    videoTextureRef.current = vt;

    return () => {
      v.pause();
      v.removeAttribute('src');
      v.load();
      vt.dispose();
    };
  }, []);

  // Update Screen Texture (Image / Video)
  useEffect(() => {
    if (!isSlotActive) {
      if (videoElRef.current && !videoElRef.current.paused) {
        videoElRef.current.pause();
      }
      return;
    }

    if (screenVideo) {
      const v = videoElRef.current;
      if (v) {
        if (v.src !== screenVideo) {
          v.src = screenVideo;
          v.play().catch(() => {});
        } else if (v.paused) {
          v.play().catch(() => {});
        }
      }
      setActiveScreenTexture(videoTextureRef.current);
    } else {
      if (videoElRef.current && !videoElRef.current.paused) {
        videoElRef.current.pause();
      }
      const imgUrl = (screenImage && screenImage.trim() !== '') ? screenImage : DEFAULT_PLACEHOLDER_URL;
      const tex = getOrCreateImageTexture(imgUrl, (loadedTex) => {
        setActiveScreenTexture(loadedTex);
      });
      setActiveScreenTexture(tex);
    }
  }, [isSlotActive, screenImage, screenVideo]);

  // Synchronize video currentTime with scene localTime
  useEffect(() => {
    if (isSlotActive && screenVideo && videoElRef.current && videoElRef.current.duration) {
      const targetSec = Math.max(0, localTime % videoElRef.current.duration);
      if (Math.abs(videoElRef.current.currentTime - targetSec) > 0.15) {
        videoElRef.current.currentTime = targetSec;
      }
    }
  }, [isSlotActive, screenVideo, localTime]);

  // Setup GSAP Animation Timeline on deviceAnimGroup (animating strictly around device's own center)
  useEffect(() => {
    if (!isSlotActive || !deviceAnimGroupRef.current) {
      if (animRef.current) animRef.current.timeline.pause(0);
      return;
    }

    if (animRef.current) {
      animRef.current.timeline.kill();
    }

    deviceAnimGroupRef.current.position.set(0, 0, 0);
    deviceAnimGroupRef.current.rotation.set(0, 0, 0);
    deviceAnimGroupRef.current.scale.setScalar(1);

    const screenMesh = deviceTransformGroupRef.current?.getObjectByName(IPHONE_SCREEN_MESH) as THREE.Mesh
      || deviceTransformGroupRef.current?.getObjectByName('Object_9') as THREE.Mesh
      || deviceTransformGroupRef.current?.getObjectByName(ANDROID_SCREEN_MESH) as THREE.Mesh
      || deviceTransformGroupRef.current?.getObjectByName('Display_ActiveArea') as THREE.Mesh
      || null;

    // Isolate camera transformations to a slot-local virtual camera so GSAP animations
    // don't swing or look at canvas center (0,0,0) and distort offset device positions
    const virtualCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    virtualCamera.position.set(0, 0, 4);
    virtualCamera.lookAt(0, 0, 0);
    virtualCameraRef.current = virtualCamera;

    const target: AnimationTarget = {
      camera: virtualCamera,
      device: deviceAnimGroupRef.current,
      screenMesh,
    };

    try {
      const anim = createAnimation(animationTemplate, 'portrait', target, speed);
      animRef.current = anim;
      const dur = anim.duration || layerDuration;
      const progress = Math.max(0, Math.min(localTime / dur, 1));
      anim.timeline.progress(progress);
      anim.timeline.pause();
    } catch {
      animRef.current = null;
    }

    return () => {
      if (animRef.current) animRef.current.timeline.kill();
    };
  }, [isSlotActive, animationTemplate, speed, layerDuration, deviceType]);

  // Sync GSAP timeline on localTime changes
  useEffect(() => {
    if (isSlotActive && animRef.current && animRef.current.timeline) {
      const dur = animRef.current.duration || layerDuration;
      const progress = Math.max(0, Math.min(localTime / dur, 1));
      animRef.current.timeline.progress(progress);
      animRef.current.timeline.pause();
    }
  }, [isSlotActive, localTime, layerDuration]);

  // Offset & scale calculation
  const baseScale = 0.15 * (deviceSize || 1);
  const prevOpacityRef = useRef<number>(-1);

  // Position & User Transform controller (without enter/exit translations)
  useFrame(() => {
    if (!isSlotActive || !slotGroupRef.current) return;

    // If outgoing transition opacity is present (during cross-scene transitions)
    const finalOpacity = Math.max(0, Math.min(1, descriptor?.transitionOpacity ?? 1));

    if (finalOpacity <= 0.001) {
      slotGroupRef.current.visible = false;
      return;
    } else {
      slotGroupRef.current.visible = true;
    }

    // Tier 1: Canvas Slot Positioning (center of the device in canvas space)
    slotGroupRef.current.position.x = posX * 1.28;
    slotGroupRef.current.position.y = posY * 1.28;
    slotGroupRef.current.position.z = 0;

    // Tier 1.5: Camera animation compensation transforms
    if (virtualCameraRef.current && camCompGroupRef.current) {
      const vCam = virtualCameraRef.current;
      camCompGroupRef.current.position.x = -vCam.position.x;
      camCompGroupRef.current.position.y = -vCam.position.y;
      camCompGroupRef.current.position.z = 4 - vCam.position.z;
      camCompGroupRef.current.rotation.x = -vCam.rotation.x;
      camCompGroupRef.current.rotation.y = -vCam.rotation.y;
      camCompGroupRef.current.rotation.z = -vCam.rotation.z;
    }

    // Tier 3: Independent User Transforms applied directly to the device
    if (deviceTransformGroupRef.current) {
      deviceTransformGroupRef.current.scale.set(baseScale, baseScale, baseScale);
      deviceTransformGroupRef.current.rotation.x = (rotX * Math.PI) / 180;
      deviceTransformGroupRef.current.rotation.y = (rotY * Math.PI) / 180;
      deviceTransformGroupRef.current.rotation.z = (rotZ * Math.PI) / 180;
    }

    // Apply cross-scene opacity only when needed
    if (finalOpacity >= 0.999) {
      if (prevOpacityRef.current < 0.999) {
        prevOpacityRef.current = 1.0;
        slotGroupRef.current.traverse((child: any) => {
          if (child.isMesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m: any) => {
              if (m) {
                m.transparent = false;
                m.depthWrite = true;
                m.depthTest = true;
                m.opacity = 1.0;
              }
            });
          }
        });
      }
    } else {
      if (Math.abs(prevOpacityRef.current - finalOpacity) > 0.005) {
        prevOpacityRef.current = finalOpacity;
        slotGroupRef.current.traverse((child: any) => {
          if (child.isMesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m: any) => {
              if (m) {
                m.transparent = true;
                m.depthWrite = true;
                m.depthTest = true;
                m.opacity = finalOpacity;
              }
            });
          }
        });
      }
    }
  });

  return (
    <group ref={slotGroupRef} visible={isSlotActive}>
      {/* Tier 1.5: Camera animation compensation group */}
      <group ref={camCompGroupRef}>
        {/* Tier 2: Template animation (GSAP animates around device's own local center) */}
        <group ref={deviceAnimGroupRef}>
          {/* Tier 3: Independent device transforms (User Size, RotX, RotY) */}
          <group ref={deviceTransformGroupRef}>
            <PooledIPhoneModel
              deviceColor={deviceColor}
              screenTexture={activeScreenTexture}
              visible={deviceType === 'iphone'}
            />
            <PooledAndroidModel
              deviceColor={deviceColor}
              screenTexture={activeScreenTexture}
              visible={deviceType === 'android'}
            />
          </group>
        </group>
      </group>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// Master Device Pool Canvas Layer
// ─────────────────────────────────────────────────────────────
export default function DevicePoolCanvas({
  activeDevices = [],
  zIndex = 5,
}: {
  activeDevices: ActiveDeviceDescriptor[];
  zIndex?: number;
}) {
  // Stable Slot Assignment: map active devices to pooled slots 0..POOL_SIZE-1
  const assignedSlots = useMemo(() => {
    const slots: (ActiveDeviceDescriptor | null)[] = Array(POOL_SIZE).fill(null);
    activeDevices.slice(0, POOL_SIZE).forEach((dev, idx) => {
      slots[idx] = dev;
    });
    return slots;
  }, [activeDevices]);

  const hasAnyActiveDevice = activeDevices.length > 0;

  return (
    <div
      data-device-pool-canvas-layer="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: zIndex,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45, near: 0.1, far: 100 }}
        shadows="percentage"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          background: 'transparent',
          pointerEvents: 'none',
          imageRendering: 'auto',
        }}
        className="motion-device-canvas"
        dpr={typeof window !== 'undefined' ? Math.min(Math.max(window.devicePixelRatio || 1, 2), 3) : 2}
      >
        {/* Ambient Base Light */}
        <ambientLight intensity={0.35} />

        {/* Key Light: Main directional source with shadow mapping */}
        <directionalLight
          color="#fffef8"
          intensity={2.2}
          position={[6, 8, 6]}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />

        {/* Fill Light: Soft cool-tinted fill from opposite angle */}
        <directionalLight
          color="#818cf8"
          intensity={0.65}
          position={[-6, 3, 5]}
        />

        {/* Cinematic Rim / Backlight 1: Warm Yellow Edge Highlight */}
        <pointLight
          color="#facc15"
          intensity={2.2}
          distance={25}
          position={[-5, 5, -4]}
        />

        {/* Cinematic Rim / Backlight 2: Warm Specular Highlight */}
        <pointLight
          color="#fb7185"
          intensity={1.8}
          distance={25}
          position={[5, 6, -4]}
        />

        {/* Back Direction Light: Illuminates device back when flipped */}
        <directionalLight
          color="#ffffff"
          intensity={2.0}
          position={[0, 4, -8]}
        />

        {/* High-Key Studio Overhead Spotlight */}
        <spotLight
          color="#ffffff"
          intensity={2.0}
          position={[0, 9, 4]}
          angle={0.65}
          penumbra={0.75}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Under/Bounce Soft Light */}
        <pointLight
          color="#a78bfa"
          intensity={0.45}
          distance={15}
          position={[0, -5, 3]}
        />

        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.35} />
          {assignedSlots.map((desc, idx) => (
            <PooledDeviceSlot
              key={`pooled-device-slot-${idx}`}
              slotIndex={idx}
              descriptor={desc}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}
