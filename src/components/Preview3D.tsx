/* eslint-disable react-hooks/immutability */
'use client';

import React, { Suspense, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useAppState } from '@/store';
import PhoneModel from './PhoneModel';
import FloatingTopBar from './FloatingTopBar';

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
      <ambientLight intensity={scene.ambientIntensity} />
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
  const { zoom } = state.scene;

  useFrame(({ camera }) => {
    const targetZoom = zoom || 1.0;
    if (camera.zoom !== targetZoom) {
      camera.zoom = targetZoom;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
  });

  return null;
}

export default function Preview3D() {
  const { state, dispatch } = useAppState();

  const cameraPosition: [number, number, number] = [0, 0, 4];

  const isPortrait = state.orientation === 'portrait';
  const containerStyle: React.CSSProperties = {
    cursor: 'default',
    aspectRatio: isPortrait ? '9 / 16' : '16 / 9',
    width: isPortrait ? 'auto' : '85%',
    height: isPortrait ? '85%' : 'auto',
    maxWidth: '90%',
    maxHeight: '90%',
    transition: 'all 0.3s ease-in-out',
  };

  return (
    <div 
      className="preview-canvas-container" 
      id="preview-3d" 
      style={containerStyle}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ zIndex: 50 }}>
        <FloatingTopBar />
      </div>

      <Canvas
        camera={{
          fov: 45,
          near: 0.1,
          far: 100,
          position: cameraPosition,
        }}
        onPointerMissed={() => dispatch({ selectedTextId: null })}
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

          <Environment preset="city" environmentIntensity={0.15} />
        </Suspense>
      </Canvas>



      {/* Fullscreen Button */}
      <button 
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10
        }}
        title="Fullscreen"
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
  );
}
