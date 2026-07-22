/* eslint-disable react-hooks/immutability */
'use client';

import React, { Suspense, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Hud, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useAppState } from '@/store';
import PhoneModel from './PhoneModel';
import FloatingTopBar from './FloatingTopBar';
import SceneTexts from './SceneTexts';

function GradientBackground({ color1, color2, enabled }: { color1: string; color2: string; enabled: boolean }) {
  const { scene } = useThree();

  React.useEffect(() => {
    if (!enabled) {
      scene.background = new THREE.Color(color1);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;

    return () => {
      texture.dispose();
      scene.background = null;
    };
  }, [color1, color2, enabled, scene]);

  return null;
}

function SceneLights() {
  const { state } = useAppState();
  const { scene } = state;

  return (
    <>
      <ambientLight intensity={scene.ambientIntensity * 2} />
      <directionalLight
        color={scene.directionalColor}
        intensity={scene.directionalIntensity}
        position={[5, 5, 5]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Fill light */}
      <pointLight
        color="#4488ff"
        intensity={0.3}
        position={[3, -2, 2]}
      />
    </>
  );
}

function CameraZoomController() {
  const { state } = useAppState();
  const { zoom, offsetX = 0, offsetY = 0 } = state.scene;

  useFrame(({ camera, size }) => {
    const targetZoom = zoom || 1.0;
    if (camera.zoom !== targetZoom) {
      camera.zoom = targetZoom;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }

    // Apply perfect 2D framing offsets without breaking 3D orbits
    const cam = camera as THREE.PerspectiveCamera;
    if (offsetX !== 0 || offsetY !== 0) {
      // Map 3D unit offsets to pixel offsets (approx 20% of screen width per unit)
      const pxX = -(offsetX) * (size.width / 5);
      const pxY = (offsetY) * (size.height / 5);
      cam.setViewOffset(size.width, size.height, pxX, pxY, size.width, size.height);
    } else {
      if (cam.view) cam.clearViewOffset();
    }
  });

  return null;
}

function HudCameraAdapter() {
  const { size, camera } = useThree();
  React.useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
    }
  }, [size, camera]);
  return null;
}

export default function Preview3D() {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useAppState();

  const cameraPosition: [number, number, number] = [0, 0, 4];

  const isPortrait = state.orientation === 'portrait';
  const containerStyle: React.CSSProperties = isPortrait ? {
    cursor: 'default',
    aspectRatio: '9 / 16',
    width: 'auto',
    height: '85%',
    maxWidth: '90%',
    maxHeight: '90%',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  } : {
    cursor: 'default',
    aspectRatio: '16 / 9',
    width: 'auto',
    height: '85%',
    maxWidth: '90%',
    maxHeight: '90%',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  return (
    <>
      <div onClick={(e) => e.stopPropagation()} style={{ zIndex: 50, position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)' }}>
        <FloatingTopBar />
      </div>

      <div 
        className="preview-canvas-container" 
        id="preview-3d" 
        style={containerStyle}
      >

      <Canvas
        camera={{
          fov: 45,
          near: 0.1,
          far: 100,
          position: cameraPosition,
        }}
        // DISABLED_FEATURE_START: Pointer Missed Selected Text Reset
        // DO NOT DELETE: Keeping this code disabled for future reference or reactivation.
        // onPointerMissed={() => dispatch({ selectedTextId: null })}
        // DISABLED_FEATURE_END: Pointer Missed Selected Text Reset
        shadows="percentage"
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
        dpr={[1, 2]}
      >
        <GradientBackground
          color1={state.scene.bgColor || '#1c1a16'}
          color2={state.scene.bgColor2 || '#0b0a09'}
          enabled={!!state.scene.bgGradient}
        />
        <CameraZoomController />
        <Suspense fallback={null}>
          <SceneLights />

          <PhoneModel screenshotUrl={state.screenshotUrl} />
          
          <Hud>
            <PerspectiveCamera makeDefault fov={45} near={0.1} far={100} position={cameraPosition} />
            <HudCameraAdapter />
            <ambientLight intensity={2} />
            {/* DISABLED_FEATURE_START: SceneTexts Canvas Element */}
            {/* DO NOT DELETE: Keeping this code disabled for future reference or reactivation. */}
            {/* <SceneTexts /> */}
            {/* DISABLED_FEATURE_END: SceneTexts Canvas Element */}
          </Hud>

          <Environment preset="city" environmentIntensity={0.15} />
        </Suspense>
      </Canvas>



      {/* Fullscreen Button */}
      <button 
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          color: '#000000',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'all 0.2s ease'
        }}
        title="Fullscreen"
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        onClick={() => {
          const el = document.getElementById('preview-3d');
          if (el) el.requestFullscreen();
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      </button>


    </div>
    </>
  );
}
