/* eslint-disable react-hooks/immutability */
'use client';

import React, { Suspense, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Hud, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useAppState } from '@/store';
import Link from 'next/link';
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

      {/* Undo/Redo Controls */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 50, display: 'flex', gap: '12px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', color: '#ff4d4d', cursor: 'pointer', opacity: 1, padding: 0 }} title="Go to Home Screen">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
        </Link>
        <div style={{ width: '1.5px', height: '20px', background: 'var(--border-color)', opacity: 0.8, alignSelf: 'center', margin: '0 4px' }} />
        <button onClick={undo} disabled={!canUndo} style={{ background: 'transparent', border: 'none', cursor: canUndo ? 'pointer' : 'not-allowed', opacity: canUndo ? 1 : 0.5, color: '#ff4d4d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>
        </button>
        <button onClick={redo} disabled={!canRedo} style={{ background: 'transparent', border: 'none', cursor: canRedo ? 'pointer' : 'not-allowed', opacity: canRedo ? 1 : 0.5, color: '#ff4d4d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/></svg>
        </button>
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
          
          <Hud>
            <PerspectiveCamera makeDefault fov={45} near={0.1} far={100} position={cameraPosition} />
            <HudCameraAdapter />
            <ambientLight intensity={1} />
            <SceneTexts />
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
