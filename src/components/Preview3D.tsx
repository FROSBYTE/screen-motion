/* eslint-disable react-hooks/immutability */
'use client';

import React, { Suspense, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Hud, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useAppState } from '@/store';
import PhoneModel from './PhoneModel';
import FloatingTopBar from './FloatingTopBar';
import ModelLoaderOverlay from './ModelLoaderOverlay';
import SceneTexts from './SceneTexts';

const textureCache = new Map<string, THREE.Texture>();

function updateTextureCover(texture: THREE.Texture, canvasWidth: number, canvasHeight: number) {
  if (!texture.image) return;
  const img = texture.image as HTMLImageElement;
  const imageAspect = img.width / img.height;
  const canvasAspect = canvasWidth / canvasHeight;
  
  if (canvasAspect > imageAspect) {
    texture.repeat.set(1, imageAspect / canvasAspect);
    texture.offset.set(0, (1 - texture.repeat.y) / 2);
  } else {
    texture.repeat.set(canvasAspect / imageAspect, 1);
    texture.offset.set((1 - texture.repeat.x) / 2, 0);
  }
}

function SceneBackground({
  color1,
  color2,
  enabled,
  bgImage,
}: {
  color1: string;
  color2: string;
  enabled: boolean;
  bgImage?: string | null;
}) {
  const { scene, size } = useThree();

  React.useEffect(() => {
    if (bgImage) {
      if (textureCache.has(bgImage)) {
        const tex = textureCache.get(bgImage)!;
        updateTextureCover(tex, size.width, size.height);
        scene.background = tex;
        return;
      }

      const loader = new THREE.TextureLoader();
      let isMounted = true;

      loader.load(
        bgImage,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          textureCache.set(bgImage, texture);
          
          if (isMounted) {
            updateTextureCover(texture, size.width, size.height);
            scene.background = texture;
          }
        },
        undefined,
        (err) => console.error('Failed to load background image', err)
      );

      return () => {
        isMounted = false;
      };
    }

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
    };
  }, [color1, color2, enabled, bgImage, scene, size.width, size.height]);

  return null;
}

function SceneLights() {
  const { state } = useAppState();
  const { scene } = state;

  return (
    <>
      <ambientLight intensity={scene.ambientIntensity * 3} />
      <directionalLight
        color={scene.directionalColor}
        intensity={scene.directionalIntensity * 1.5}
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
  const { state, dispatch } = useAppState();
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const handleFSChange = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fsEl = document.fullscreenElement || (document as any).webkitFullscreenElement;
      setIsFullscreen(!!fsEl);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const panel = document.getElementById('preview-panel');
    const container = document.getElementById('preview-3d');
    const el = panel || container;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentFs = document.fullscreenElement || (document as any).webkitFullscreenElement;

    if (currentFs || isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
      setIsFullscreen(false);
      panel?.classList.remove('is-fullscreen');
      container?.classList.remove('is-fullscreen');
    } else {
      if (el && el.requestFullscreen) {
        el.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(() => {
          el.classList.add('is-fullscreen');
          setIsFullscreen(true);
        });
      } else if (el && (el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
        setIsFullscreen(true);
      } else if (el) {
        el.classList.add('is-fullscreen');
        setIsFullscreen(true);
      }
    }

    // Reset camera zoom to 1.0 if modified
    if (state.scene.zoom && state.scene.zoom !== 1.0) {
      dispatch({ scene: { zoom: 1.0 } });
    }
  };

  const cameraPosition: [number, number, number] = [0, 0, 4];

  const isPortrait = state.orientation === 'portrait';
  const containerStyle: React.CSSProperties = isFullscreen
    ? (isPortrait
        ? {
            cursor: 'default',
            aspectRatio: '9 / 16',
            height: '96vh',
            width: 'auto',
            maxHeight: '96vh',
            maxWidth: '100vw',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 0 80px rgba(0,0,0,0.9)',
            transition: 'border-radius 0.4s, box-shadow 0.4s, transform 0.4s'
          }
        : {
            cursor: 'default',
            aspectRatio: '16 / 9',
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            maxHeight: '100vh',
            borderRadius: '0px',
            overflow: 'hidden',
            transition: 'border-radius 0.4s, box-shadow 0.4s, transform 0.4s'
          })
    : (isPortrait
        ? {
            cursor: 'default',
            aspectRatio: '9 / 16',
            height: '84%',
            width: 'auto',
            maxWidth: '88%',
            maxHeight: '84%',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
            transition: 'border-radius 0.4s, box-shadow 0.4s, transform 0.4s'
          }
        : {
            cursor: 'default',
            aspectRatio: '16 / 9',
            width: '92%',
            height: 'auto',
            maxWidth: '92%',
            maxHeight: '84%',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
            transition: 'border-radius 0.4s, box-shadow 0.4s, transform 0.4s'
          });

  return (
    <>
      <FloatingTopBar />
      <div 
        className={`preview-canvas-container${isFullscreen ? ' is-fullscreen' : ''}`}
        id="preview-3d" 
        onPointerDown={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'CANVAS') {
            dispatch({ selectedTextId: null });
          }
        }}
        style={{
          ...containerStyle,
          position: isFullscreen ? 'fixed' : 'relative',
          overflow: 'hidden',
          borderRadius: '24px',
        }}
      >
        <ModelLoaderOverlay />

        <Canvas
        camera={{
          fov: 45,
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
        <SceneBackground
          color1={state.scene.bgColor || '#1c1a16'}
          color2={state.scene.bgColor2 || '#0b0a09'}
          enabled={!!state.scene.bgGradient}
          bgImage={state.scene.bgImage}
        />
        <CameraZoomController />
        <Suspense fallback={null}>
          <SceneLights />

          <PhoneModel screenshotUrl={state.screenshotUrl} />
          
          <Environment preset="city" environmentIntensity={0.15} />
        </Suspense>
      </Canvas>

      {/* 2D HTML Text Overlay Layer */}
      <SceneTexts />

      {/* Zoom / Fullscreen Button */}
      <button 
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          color: '#000000',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'all 0.2s ease'
        }}
        title={isFullscreen ? "Exit Zoom / Fullscreen" : "Zoom Out / Fullscreen"}
        aria-label="Zoom / Fullscreen toggle"
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        onClick={toggleFullscreen}
      >
        {isFullscreen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        )}
      </button>

    </div>
    </>
  );
}
