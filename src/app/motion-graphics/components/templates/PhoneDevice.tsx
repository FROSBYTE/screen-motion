'use client';

import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Center } from '@react-three/drei';
import { createAnimation, AnimationTarget, TemplateAnimation } from '@/templates/animations';
import type { TemplateName } from '@/types';
import * as THREE from 'three';

export interface PhoneDeviceProps {
  deviceType?: 'iphone' | 'android';
  deviceColor?: string;
  screenImage?: string;
  // ponytail: screenVideo not yet wired to Three.js video texture; upgrade path is useVideoTexture from @react-three/drei
  screenVideo?: string;
  size?: number;
  animationTemplate?: string;
  speed?: number;
  posX?: number;
  posY?: number;
  rotX?: number;
  rotY?: number;
  className?: string;
}

// Screen mesh names in each model
const IPHONE_SCREEN_MESH = 'Object_18';
const ANDROID_SCREEN_MESH = 'S22_Ultra001_2';

function IPhoneModel({ deviceColor, screenImage }: { deviceColor: string; screenImage?: string }) {
  const { scene, materials } = useGLTF('/models/iphone16.gltf') as any;
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const initialColors = useRef<Record<string, THREE.Color>>({});
  const appliedColor = useRef('');
  const uvFixed = useRef(false);

  // Fix UV coordinates on the screen mesh so the image maps correctly
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

  // Apply device color to body materials (not screen)
  useEffect(() => {
    if (appliedColor.current === deviceColor) return;
    appliedColor.current = deviceColor;

    // Store initial colors once
    if (Object.keys(initialColors.current).length === 0) {
      cloned.traverse((child: any) => {
        if (!child.isMesh) return;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat: any) => {
          if (mat && mat.color && !initialColors.current[mat.uuid]) {
            initialColors.current[mat.uuid] = mat.color.clone();
          }
        });
      });
    }

    cloned.traverse((child: any) => {
      if (!child.isMesh) return;
      // Skip the screen mesh entirely
      if (child.name === IPHONE_SCREEN_MESH) return;

      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat: any) => {
        if (!mat || !mat.color) return;
        const initial = initialColors.current[mat.uuid];
        if (!initial) return;

        // Skip black materials (camera, sensors, notch)
        if (initial.r < 0.1 && initial.g < 0.1 && initial.b < 0.1 && !mat.map) {
          mat.color.set('#000000');
          return;
        }
        // Skip emissive (flash)
        if (mat.emissive && (mat.emissive.r > 0.2 || mat.emissive.g > 0.2)) return;

        mat.color.set(deviceColor);
        if (mat.map) mat.map = null;
        mat.needsUpdate = true;
      });
    });
  }, [deviceColor, cloned]);

  // Apply screen image
  useEffect(() => {
    const screenMesh = cloned.getObjectByName(IPHONE_SCREEN_MESH) as THREE.Mesh | null;
    if (!screenMesh) return;

    if (screenImage) {
      const loader = new THREE.TextureLoader();
      loader.load(screenImage, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.flipY = true;
        screenMesh.material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
      });
    } else {
      screenMesh.material = new THREE.MeshBasicMaterial({ color: '#0f0f1a', toneMapped: false });
    }
  }, [screenImage, cloned]);

  return <primitive object={cloned} />;
}

function AndroidModelComponent({ deviceColor, screenImage }: { deviceColor: string; screenImage?: string }) {
  const { scene } = useGLTF('/models/S22Ultra.glb') as any;
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const initialColors = useRef<Record<string, THREE.Color>>({});
  const appliedColor = useRef('');
  const uvFixed = useRef(false);

  // Fix UV coordinates on the screen mesh
  useEffect(() => {
    if (uvFixed.current) return;
    const screenMesh = cloned.getObjectByName(ANDROID_SCREEN_MESH) as THREE.Mesh | null;
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

  useEffect(() => {
    if (appliedColor.current === deviceColor) return;
    appliedColor.current = deviceColor;

    if (Object.keys(initialColors.current).length === 0) {
      cloned.traverse((child: any) => {
        if (!child.isMesh) return;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat: any) => {
          if (mat && mat.color && !initialColors.current[mat.uuid]) {
            initialColors.current[mat.uuid] = mat.color.clone();
          }
        });
      });
    }

    cloned.traverse((child: any) => {
      if (!child.isMesh) return;
      if (child.name === ANDROID_SCREEN_MESH) return;

      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat: any) => {
        if (!mat || !mat.color) return;
        const initial = initialColors.current[mat.uuid];
        if (!initial) return;

        if (initial.r < 0.1 && initial.g < 0.1 && initial.b < 0.1) return;
        if (mat.emissive && (mat.emissive.r > 0.2 || mat.emissive.g > 0.2)) return;

        mat.color.set(deviceColor);
        mat.needsUpdate = true;
      });
    });
  }, [deviceColor, cloned]);

  useEffect(() => {
    const screenMesh = cloned.getObjectByName(ANDROID_SCREEN_MESH) as THREE.Mesh | null;
    if (!screenMesh) return;

    if (screenImage) {
      const loader = new THREE.TextureLoader();
      loader.load(screenImage, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.flipY = true;
        screenMesh.material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
      });
    } else {
      screenMesh.material = new THREE.MeshBasicMaterial({ color: '#0f0f1a', toneMapped: false });
    }
  }, [screenImage, cloned]);

  return <primitive object={cloned} scale={88.58} />;
}

function AnimatedDevice({
  deviceType,
  deviceColor,
  screenImage,
  animationTemplate,
  speed = 1,
  deviceSize = 1,
  posX = 0,
  posY = 0,
  rotX = 0,
  rotY = 0,
}: {
  deviceType: string;
  deviceColor: string;
  screenImage?: string;
  animationTemplate: string;
  speed: number;
  deviceSize: number;
  posX: number;
  posY: number;
  rotX: number;
  rotY: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const animRef = useRef<TemplateAnimation | null>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (!groupRef.current) return;

    if (animRef.current) {
      animRef.current.timeline.kill();
    }

    groupRef.current.position.set(0, 0, 0);
    groupRef.current.rotation.set(0, 0, 0);
    groupRef.current.scale.setScalar(1);

    const target: AnimationTarget = {
      camera: camera as THREE.PerspectiveCamera,
      device: groupRef.current,
      screenMesh: null,
    };

    try {
      const anim = createAnimation(animationTemplate as TemplateName, 'portrait', target, speed);
      animRef.current = anim;
      anim.timeline.play();
    } catch {
      animRef.current = null;
    }

    return () => {
      if (animRef.current) animRef.current.timeline.kill();
    };
  }, [animationTemplate, camera, speed]);

  useFrame(() => {
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      <group 
        scale={[0.15 * deviceSize, 0.15 * deviceSize, 0.15 * deviceSize]}
        position={[posX, posY, 0]}
        rotation={[(rotX * Math.PI) / 180, (rotY * Math.PI) / 180, 0]}
      >
        {deviceType === 'iphone' ? (
          <IPhoneModel deviceColor={deviceColor} screenImage={screenImage} />
        ) : (
          <Center>
            <AndroidModelComponent deviceColor={deviceColor} screenImage={screenImage} />
          </Center>
        )}
      </group>
    </group>
  );
}

export default function PhoneDevice({
  deviceType = 'iphone',
  deviceColor = '#1a1a1a',
  screenImage,
  screenVideo,
  size = 1,
  animationTemplate = 'float',
  speed = 1,
  posX = 0,
  posY = 0,
  rotX = 0,
  rotY = 0,
  className = '',
}: PhoneDeviceProps) {
  const isPortrait = true;
  const containerStyle: React.CSSProperties = {
    cursor: 'default',
    aspectRatio: '9 / 16',
    height: '50.4%',
    width: 'auto',
    maxWidth: '52.8%',
    maxHeight: '50.4%',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
    margin: '0 auto',
    position: 'relative',
    top: '50%',
    transform: 'translateY(-50%)',
  };

  return (
    <div className={className} style={containerStyle}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-3, 3, -2]} intensity={0.4} />
        <Suspense fallback={null}>
          <AnimatedDevice
            deviceType={deviceType}
            deviceColor={deviceColor}
            screenImage={screenImage}
            animationTemplate={animationTemplate}
            speed={speed}
            deviceSize={size === -1 ? 1 : size}
            posX={posX}
            posY={posY}
            rotX={rotX}
            rotY={rotY}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
