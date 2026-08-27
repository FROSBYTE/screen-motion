'use client';

import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Center, useVideoTexture, useTexture, Environment } from '@react-three/drei';
import { createAnimation, AnimationTarget, TemplateAnimation } from '@/templates/animations';
import type { TemplateName } from '@/types';
import * as THREE from 'three';

export interface PhoneDeviceProps {
  deviceType?: 'iphone' | 'android';
  deviceColor?: string;
  screenImage?: string;
  screenVideo?: string;
  size?: number;
  deviceSize?: number;
  animationTemplate?: string;
  speed?: number;
  posX?: number;
  posY?: number;
  rotX?: number;
  rotY?: number;
  rotZ?: number;
  className?: string;
}

// Screen mesh names in each model
const IPHONE_SCREEN_MESH = 'Object_18';
const ANDROID_SCREEN_MESH = 'S22_Ultra001_2';

function usePlaceholderTexture() {
  return useTexture('/Drag_And_Drop.png');
}

function VideoScreenMaterial({ url }: { url: string }) {
  const texture = useVideoTexture(url, {
    loop: true,
    start: true,
    muted: true,
    playsInline: true,
  });

  React.useLayoutEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.flipY = true;
      texture.needsUpdate = true;
    }
  }, [texture]);

  return <meshBasicMaterial map={texture} toneMapped={false} />;
}

function ImageScreenMaterial({ url }: { url: string }) {
  const safeUrl = url && url.trim() !== '' ? url : '/Drag_And_Drop.png';
  const texture = useTexture(safeUrl);

  React.useLayoutEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.anisotropy = 16;
      texture.flipY = true;
      texture.needsUpdate = true;
    }
  }, [texture]);

  return <meshBasicMaterial map={texture} toneMapped={false} />;
}

function IPhoneModel({ deviceColor, screenImage, screenVideo }: { deviceColor: string; screenImage?: string; screenVideo?: string }) {
  const { scene } = useGLTF('/models/iphone16.gltf') as any;
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const initialColors = useRef<Record<string, THREE.Color>>({});
  const uvFixed = useRef(false);
  const [screenMeshGeometry, setScreenMeshGeometry] = React.useState<THREE.BufferGeometry | null>(null);

  // Store initial colors on first pass across all cloned materials
  useEffect(() => {
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
  }, [cloned]);

  // Fix UV coordinates on the screen mesh so the image/video maps correctly
  useEffect(() => {
    const screenMesh = cloned.getObjectByName(IPHONE_SCREEN_MESH) as THREE.Mesh | null;
    if (!screenMesh) return;
    
    screenMesh.visible = false;
    setScreenMeshGeometry(screenMesh.geometry);

    if (uvFixed.current) return;
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

  // Apply device color to body materials matching /editor exactly
  useEffect(() => {
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
  }, [deviceColor, cloned]);

  useEffect(() => {
    return () => {
      cloned.traverse((child: any) => {
        if (child.isMesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m: any) => m?.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
    };
  }, [cloned]);

  return (
    <group>
      <primitive object={cloned} />
      {screenMeshGeometry && (
        <mesh geometry={screenMeshGeometry}>
          {screenVideo ? (
            <Suspense fallback={<ImageScreenMaterial url="/Drag_And_Drop.png" />}>
              <VideoScreenMaterial url={screenVideo} />
            </Suspense>
          ) : (
            <Suspense fallback={<ImageScreenMaterial url="/Drag_And_Drop.png" />}>
              <ImageScreenMaterial url={screenImage || '/Drag_And_Drop.png'} />
            </Suspense>
          )}
        </mesh>
      )}
    </group>
  );
}

function AndroidModelComponent({ deviceColor, screenImage, screenVideo }: { deviceColor: string; screenImage?: string; screenVideo?: string }) {
  const { scene } = useGLTF('/models/S22Ultra.glb') as any;
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const uvFixed = useRef(false);
  const [screenMeshGeometry, setScreenMeshGeometry] = React.useState<THREE.BufferGeometry | null>(null);

  // Fix UV coordinates on the screen mesh
  useEffect(() => {
    const screenMesh = cloned.getObjectByName(ANDROID_SCREEN_MESH) as THREE.Mesh | null;
    if (!screenMesh) return;

    screenMesh.visible = false;
    setScreenMeshGeometry(screenMesh.geometry);

    if (uvFixed.current) return;
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
          // Camera lens, sensors, USB, flash, bezel are always black #000000
          mat.color.set('#000000');
          if (mat.map) mat.map = null;
        }
        mat.needsUpdate = true;
      });
    });
  }, [deviceColor, cloned]);

  useEffect(() => {
    return () => {
      cloned.traverse((child: any) => {
        if (child.isMesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m: any) => m?.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
    };
  }, [cloned]);

  return (
    <group position={[0, -7.3704, 0]} scale={88.58}>
      <primitive object={cloned} />
      {screenMeshGeometry && (
        <mesh geometry={screenMeshGeometry}>
          {screenVideo ? (
            <Suspense fallback={<ImageScreenMaterial url="/Drag_And_Drop.png" />}>
              <VideoScreenMaterial url={screenVideo} />
            </Suspense>
          ) : (
            <Suspense fallback={<ImageScreenMaterial url="/Drag_And_Drop.png" />}>
              <ImageScreenMaterial url={screenImage || '/Drag_And_Drop.png'} />
            </Suspense>
          )}
        </mesh>
      )}
    </group>
  );
}

function AnimatedDevice({
  deviceType,
  deviceColor,
  screenImage,
  screenVideo,
  animationTemplate,
  speed = 1,
  deviceSize = 1,
  posX = 0,
  posY = 0,
  rotX = 0,
  rotY = 0,
  rotZ = 0,
}: {
  deviceType: string;
  deviceColor: string;
  screenImage?: string;
  screenVideo?: string;
  animationTemplate: string;
  speed: number;
  deviceSize: number;
  posX: number;
  posY: number;
  rotX: number;
  rotY: number;
  rotZ: number;
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
        rotation={[(rotX * Math.PI) / 180, (rotY * Math.PI) / 180, (rotZ * Math.PI) / 180]}
      >
        {deviceType === 'iphone' ? (
          <IPhoneModel deviceColor={deviceColor} screenImage={screenImage} screenVideo={screenVideo} />
        ) : (
          <AndroidModelComponent deviceColor={deviceColor} screenImage={screenImage} screenVideo={screenVideo} />
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
  deviceSize,
  animationTemplate = 'float',
  speed = 1,
  posX = 0,
  posY = 0,
  rotX = 0,
  rotY = 0,
  rotZ = 0,
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
        camera={{ position: [0, 0, 4], fov: 45, near: 0.1, far: 100 }}
        shadows="percentage"
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        style={{ background: 'transparent' }}
        className="motion-device-canvas"
        dpr={[2, 3]}
      >
        {/* Ambient Base Light */}
        <ambientLight intensity={0.35} />

        {/* Key Light: Main directional source with shadow mapping */}
        <directionalLight
          color="#fffef8"
          intensity={2.2}
          position={[6, 8, 6]}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
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
          <AnimatedDevice
            deviceType={deviceType}
            deviceColor={deviceColor}
            screenImage={screenImage}
            screenVideo={screenVideo}
            animationTemplate={animationTemplate}
            speed={speed}
            deviceSize={deviceSize ?? (size === -1 ? 1 : size) ?? 1}
            posX={posX}
            posY={posY}
            rotX={rotX}
            rotY={rotY}
            rotZ={rotZ}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
