'use client';

import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { useAppState } from '@/store';
import PhoneModel from './PhoneModel';

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
      {/* Rim light */}
      <pointLight
        color={scene.rimColor}
        intensity={scene.rimIntensity * 3}
        position={[-3, 2, -3]}
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

function GradientBackground() {
  const { state } = useAppState();
  const { bgColor1, bgColor2 } = state.scene;

  const meshRef = React.useRef<THREE.Mesh>(null!);

  // Create gradient texture
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, bgColor1);
    gradient.addColorStop(1, bgColor2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [bgColor1, bgColor2]);

  return (
    <mesh ref={meshRef} position={[0, 0, -10]} scale={[40, 40, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={gradientTexture} depthWrite={false} />
    </mesh>
  );
}

// Needed for THREE namespace in GradientBackground
import * as THREE from 'three';

export default function Preview3D() {
  const { state } = useAppState();

  const cameraPosition: [number, number, number] =
    state.orientation === 'portrait' ? [0, 0.5, 4] : [0, 0, 4.5];

  return (
    <div className="preview-canvas-container" id="preview-3d">
      <Canvas
        camera={{
          fov: 45 / (state.scene.zoom || 1.0),
          near: 0.1,
          far: 100,
          position: cameraPosition,
        }}
        shadows="percentage"
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <GradientBackground />
          <SceneLights />

          <PhoneModel screenshotUrl={state.screenshotUrl} />



          <Environment preset="city" environmentIntensity={0.15} />
        </Suspense>
      </Canvas>

      {/* Preview badge / Loading Indicator */}
      <div className="preview-badge">
        <span className="preview-badge-dot" />
        Live Preview
      </div>

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

      {/* No screenshot overlay */}
      {!state.screenshotUrl && (
        <div className="no-screenshot-overlay">
          <div className="no-screenshot-message">
            Upload a screenshot to see it on the device
          </div>
        </div>
      )}
    </div>
  );
}
