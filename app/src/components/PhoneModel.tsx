'use client';

import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, useTexture } from '@react-three/drei';
import { useAppState } from '@/store';
import { createAnimation, AnimationTarget, TemplateAnimation } from '@/templates/animations';

function ScreenMaterial({ url }: { url: string }) {
  const texture = useTexture(url);
  
  // Configure texture
  React.useLayoutEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
    }
  }, [texture]);

  return (
    <meshStandardMaterial
      map={texture}
      metalness={0}
      roughness={0.3}
      emissive="#111"
      emissiveMap={texture}
      emissiveIntensity={0.2}
    />
  );
}

// Procedural phone model (used until real GLB models are integrated)
function PhoneModel({ screenshotUrl }: { screenshotUrl: string | null }) {
  const { state } = useAppState();
  const groupRef = useRef<THREE.Group>(null!);
  const screenRef = useRef<THREE.Mesh>(null!);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const animRef = useRef<TemplateAnimation | null>(null);

  // Phone dimensions
  const phoneWidth = 1.6;
  const phoneHeight = 3.2;
  const phoneDepth = 0.15;
  const screenInset = 0.08;
  const cornerRadius = 0.15;

  // Screen dimensions
  const screenW = phoneWidth - screenInset * 2;
  const screenH = phoneHeight - screenInset * 3;

  // Create / recreate animation when template, orientation, or speed changes
  useEffect(() => {
    if (!groupRef.current || !cameraRef.current) return;

    // Kill previous animation
    if (animRef.current) {
      animRef.current.timeline.kill();
    }

    // Reset transforms
    groupRef.current.position.set(0, 0, 0);
    groupRef.current.rotation.set(0, 0, 0);
    groupRef.current.scale.setScalar(1);

    const target: AnimationTarget = {
      camera: cameraRef.current,
      device: groupRef.current,
      screenMesh: screenRef.current || null,
    };

    const anim = createAnimation(state.template, state.orientation, target, state.speed);
    animRef.current = anim;
    anim.timeline.play();

    return () => {
      anim.timeline.kill();
    };
  }, [state.template, state.orientation, state.speed]);

  // Update camera to match R3F camera
  useFrame(({ camera }) => {
    if (cameraRef.current !== camera) {
      cameraRef.current = camera as THREE.PerspectiveCamera;
    }
  });

  // Assign the camera ref on first render
  useFrame(({ camera }) => {
    if (!cameraRef.current) {
      cameraRef.current = camera as THREE.PerspectiveCamera;
    }
  });

  // Device color based on type
  const bodyColor = state.device === 'android' ? '#1a1a2e' : '#2a2a3e';
  const frameColor = state.device === 'android' ? '#333350' : '#444468';

  return (
    <group ref={groupRef} scale={[0.8, 0.8, 0.8]}>
      {/* Phone body */}
      <RoundedBox
        args={[phoneWidth, phoneHeight, phoneDepth]}
        radius={cornerRadius}
        smoothness={8}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={bodyColor}
          metalness={0.7}
          roughness={0.2}
        />
      </RoundedBox>

      {/* Frame / bezel highlight */}
      <RoundedBox
        args={[phoneWidth + 0.01, phoneHeight + 0.01, phoneDepth - 0.02]}
        radius={cornerRadius + 0.01}
        smoothness={8}
      >
        <meshStandardMaterial
          color={frameColor}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.3}
        />
      </RoundedBox>

      {/* Screen */}
      <mesh
        ref={screenRef}
        position={[0, screenInset * 0.5, phoneDepth / 2 + 0.001]}
        castShadow={false}
        receiveShadow={false}
      >
        <planeGeometry args={[screenW, screenH]} />
        {screenshotUrl ? (
          <React.Suspense fallback={<meshStandardMaterial color="#0f0f1a" />}>
            <ScreenMaterial url={screenshotUrl} />
          </React.Suspense>
        ) : (
          <meshStandardMaterial
            color="#0f0f1a"
            metalness={0}
            roughness={0.5}
          />
        )}
      </mesh>

      {/* Camera notch (Android-style punch hole or iOS dynamic island) */}
      {state.device === 'android' ? (
        <mesh position={[0, phoneHeight / 2 - 0.2, phoneDepth / 2 + 0.002]}>
          <circleGeometry args={[0.06, 32]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      ) : (
        <mesh position={[0, phoneHeight / 2 - 0.22, phoneDepth / 2 + 0.002]}>
          <planeGeometry args={[0.5, 0.12]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      )}

      {/* Side buttons */}
      <mesh position={[phoneWidth / 2 + 0.015, 0.5, 0]}>
        <boxGeometry args={[0.03, 0.25, 0.08]} />
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[phoneWidth / 2 + 0.015, 0.1, 0]}>
        <boxGeometry args={[0.03, 0.15, 0.08]} />
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

export default PhoneModel;
