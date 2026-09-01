'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useAppState } from '@/store';
import { createAnimation, AnimationTarget, TemplateAnimation } from '@/templates/animations';
import { Model as IPhone16 } from './IPhone16';
import { Model as AndroidModel } from './AndroidModel';
import { Center } from '@react-three/drei';

function PhoneModel({ screenshotUrl }: { screenshotUrl: string | null }) {
  const { state } = useAppState();
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null!);
  const animRef = useRef<TemplateAnimation | null>(null);
  const videoRestartRef = useRef<(() => void) | null>(null);

  const handleVideoRestart = useCallback((restart: () => void) => {
    videoRestartRef.current = restart;
  }, []);

  // Create / recreate animation when template, orientation, or device changes
  useEffect(() => {
    if (!groupRef.current || !camera) return;

    // Kill previous animation
    if (animRef.current) {
      animRef.current.timeline.kill();
    }

    // Reset transforms
    groupRef.current.position.set(0, 0, 0);
    groupRef.current.rotation.set(0, 0, 0);
    groupRef.current.scale.setScalar(1);

    // Retrieve screen mesh dynamically from the GLTF children for opacity transitions
    const screenMesh = groupRef.current.getObjectByName('Object_18') as THREE.Mesh 
      || groupRef.current.getObjectByName('Object_9') as THREE.Mesh 
      || groupRef.current.getObjectByName('S22_Ultra001_2') as THREE.Mesh 
      || groupRef.current.getObjectByName('Display_ActiveArea') as THREE.Mesh 
      || null;

    const target: AnimationTarget = {
      camera: camera as THREE.PerspectiveCamera,
      device: groupRef.current,
      screenMesh: screenMesh,
    };

    const anim = createAnimation(state.template, state.orientation, target, state.speed);
    animRef.current = anim;
    anim.timeline.play();

    return () => {
      anim.timeline.kill();
    };
  }, [state.template, state.orientation, state.device, camera]);

  // Dynamically update timescale when speed slider changes without restarting or auto-playing
  useEffect(() => {
    if (animRef.current) {
      animRef.current.timeline.timeScale(state.speed);
    }
  }, [state.speed]);

  // Restart animation only when export rendering begins
  useEffect(() => {
    if (state.exportStatus === 'rendering' && animRef.current) {
      animRef.current.timeline.restart();
      // Also restart video if present
      if (videoRestartRef.current) {
        videoRestartRef.current();
      }
    }
  }, [state.exportStatus]);

  // Restart animation when user clicks Preview button
  useEffect(() => {
    if (state.previewTrigger && animRef.current) {
      animRef.current.timeline.restart();
      // Also restart video if present
      if (videoRestartRef.current) {
        videoRestartRef.current();
      }
    }
  }, [state.previewTrigger]);

  return (
    <group>
      <group ref={groupRef}>
        <group>
          <React.Suspense fallback={null}>
            <group 
              scale={[0.15, 0.15, 0.15]}
              rotation-x={((state.scene.rotationX || 0) * Math.PI) / 180}
              rotation-y={((state.scene.rotationY || 0) * Math.PI) / 180}
            >
            {state.device === 'ios' ? (
              <IPhone16 screenshotUrl={screenshotUrl} mediaType={state.mediaType} onVideoRestart={handleVideoRestart} />
            ) : (
              <AndroidModel screenshotUrl={screenshotUrl} mediaType={state.mediaType} onVideoRestart={handleVideoRestart} />
            )}
          </group>
        </React.Suspense>
        </group>
      </group>
    </group>
  );
}

export default PhoneModel;
