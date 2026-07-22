'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useAppState } from '@/store';
import { createAnimation, AnimationTarget, TemplateAnimation } from '@/templates/animations';
import { Model as IPhone16 } from './IPhone16';
import { Model as AndroidModel } from './AndroidModel';
import { Center } from '@react-three/drei';
import SceneTexts from './SceneTexts';

function PhoneModel({ screenshotUrl }: { screenshotUrl: string | null }) {
  const { state } = useAppState();
  const groupRef = useRef<THREE.Group>(null!);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const animRef = useRef<TemplateAnimation | null>(null);

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

    // Retrieve screen mesh dynamically from the GLTF children for opacity transitions
    const screenMesh = groupRef.current.getObjectByName('Object_18') as THREE.Mesh || groupRef.current.getObjectByName('Object_9') as THREE.Mesh || null;

    const target: AnimationTarget = {
      camera: cameraRef.current,
      device: groupRef.current,
      screenMesh: screenMesh,
    };

    const anim = createAnimation(state.template, state.orientation, target, state.speed);
    animRef.current = anim;
    anim.timeline.play();

    return () => {
      anim.timeline.kill();
    };
  }, [state.template, state.orientation, state.speed, state.device]);

  // Update camera to match R3F camera
  useFrame(({ camera }) => {
    if (cameraRef.current !== camera) {
      cameraRef.current = camera as THREE.PerspectiveCamera;
    }
  });

  // Restart animation only when export rendering begins
  useEffect(() => {
    if (state.exportStatus === 'rendering' && animRef.current) {
      animRef.current.timeline.restart();
    }
  }, [state.exportStatus]);

  // Restart animation when user clicks Preview button
  useEffect(() => {
    if (state.previewTrigger && animRef.current) {
      animRef.current.timeline.restart();
    }
  }, [state.previewTrigger]);

  return (
    <group>
      <group ref={groupRef}>
        <group>
          <React.Suspense fallback={null}>
            <group 
              scale={[0.15, 0.15, 0.15]}
              rotation-y={((state.scene.rotationY || 0) * Math.PI) / 180}
            >
            {state.device === 'ios' ? (
              <IPhone16 screenshotUrl={screenshotUrl} />
            ) : (
              <Center>
                <AndroidModel screenshotUrl={screenshotUrl} />
              </Center>
            )}
          </group>
        </React.Suspense>
        </group>
      </group>
    </group>
  );
}

export default PhoneModel;
